import { defineStore } from 'pinia'
import { fetchFundingRate, fetchKlines, fetchPrice, fetchTicker } from '../api/binance'
import type { TimeframeConsensus, TimeframeConsensusItem } from '../types/analysis'
import type { FundingInfo, Kline, Ticker24h, TimeInterval } from '../types/market'
import { calculateIndicators } from '../utils/indicators'
import { scoreMarket } from '../utils/scoring'

const STORAGE_KEY = 'crypto-analyzer-market'

export const useMarketStore = defineStore('market', {
  state: () => ({
    symbol: 'BTCUSDT',
    interval: '15m' as TimeInterval,
    klines: [] as Kline[],
    ticker: null as Ticker24h | null,
    price: 0,
    funding: null as FundingInfo | null,
    consensus: {
      bias: 'wait',
      agreement: 0,
      items: [],
      summary: '等待多周期数据',
    } as TimeframeConsensus,
    loading: false,
    error: '',
  }),
  actions: {
    hydrate() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as { symbol?: string; interval?: TimeInterval }
      if (saved.symbol) this.symbol = saved.symbol
      if (saved.interval) this.interval = saved.interval
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ symbol: this.symbol, interval: this.interval }))
    },
    setSymbol(symbol: string) {
      this.symbol = symbol
      this.persist()
    },
    setInterval(interval: TimeInterval) {
      this.interval = interval
      this.persist()
    },
    async fetchKlines() {
      this.klines = await fetchKlines(this.symbol, this.interval)
    },
    async fetchTicker() {
      this.ticker = await fetchTicker(this.symbol)
    },
    async fetchPrice() {
      this.price = await fetchPrice(this.symbol)
    },
    async fetchFundingRate() {
      this.funding = await fetchFundingRate(this.symbol)
    },
    async fetchConsensus() {
      const intervals: TimeInterval[] = ['15m', '1h', '4h']
      const results = await Promise.all(intervals.map(async (interval) => {
        const klines = await fetchKlines(this.symbol, interval, 240)
        const indicators = calculateIndicators(klines)
        const analysis = scoreMarket(klines, indicators)
        return {
          interval,
          direction: analysis.direction,
          trend: analysis.trend,
          confidence: analysis.confidence,
        } satisfies TimeframeConsensusItem
      }))
      const longVotes = results.filter((item) => item.direction === 'long').length
      const shortVotes = results.filter((item) => item.direction === 'short').length
      const waitVotes = results.filter((item) => item.direction === 'wait').length
      const bias = longVotes > shortVotes && longVotes > waitVotes
        ? 'long'
        : shortVotes > longVotes && shortVotes > waitVotes
          ? 'short'
          : 'wait'
      const agreement = Math.round((Math.max(longVotes, shortVotes, waitVotes) / results.length) * 100)
      this.consensus = {
        bias,
        agreement,
        items: results,
        summary: bias === 'wait'
          ? '多周期方向分歧，建议等待'
          : `${agreement}% 周期指向${bias === 'long' ? '偏多' : '偏空'}，可作为主计划过滤条件`,
      }
    },
    async refreshMarketData() {
      this.loading = true
      this.error = ''
      try {
        await Promise.all([
          this.fetchKlines(),
          this.fetchTicker(),
          this.fetchPrice(),
          this.fetchFundingRate(),
          this.fetchConsensus(),
        ])
      } catch (error) {
        this.error = error instanceof Error ? error.message : '行情数据加载失败'
      } finally {
        this.loading = false
      }
    },
  },
})
