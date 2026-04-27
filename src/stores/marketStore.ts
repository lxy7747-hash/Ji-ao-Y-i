import { defineStore } from 'pinia'
import { fetchFundingRate, fetchKlines, fetchPrice, fetchTicker } from '../api/binance'
import type { TimeframeConsensus, TimeframeConsensusItem } from '../types/analysis'
import type { FundingInfo, Kline, Ticker24h, TimeInterval } from '../types/market'
import { calculateIndicators } from '../utils/indicators'
import { scoreMarket } from '../utils/scoring'

const STORAGE_KEY = 'crypto-analyzer-market'

let tickerSocket: WebSocket | null = null
let fundingSocket: WebSocket | null = null
let tickerReconnectTimer: number | null = null
let fundingReconnectTimer: number | null = null
let pricePollTimer: number | null = null
let tickerPollTimer: number | null = null
let fundingRefreshTimer: number | null = null
let fundingCountdownTimer: number | null = null

export const useMarketStore = defineStore('market', {
  state: () => ({
    symbol: 'BTCUSDT',
    interval: '15m' as TimeInterval,
    klines: [] as Kline[],
    ticker: null as Ticker24h | null,
    price: 0,
    priceUpdatedAt: 0,
    tickerConnected: false,
    funding: null as FundingInfo | null,
    fundingCountdownMs: 0,
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
      this.restartRealtime()
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
      this.priceUpdatedAt = Date.now()
    },
    async fetchFundingRate() {
      this.funding = await fetchFundingRate(this.symbol)
      this.updateFundingCountdown()
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
    updateFundingCountdown() {
      const nextFundingTime = this.funding?.nextFundingTime ?? 0
      this.fundingCountdownMs = Math.max(0, nextFundingTime - Date.now())
    },
    startTickerStream() {
      const previousSocket = tickerSocket
      tickerSocket = null
      previousSocket?.close()
      if (tickerReconnectTimer) window.clearTimeout(tickerReconnectTimer)

      const socket = new WebSocket(`wss://fstream.binance.com/ws/${this.symbol.toLowerCase()}@ticker`)
      tickerSocket = socket
      socket.onopen = () => {
        this.tickerConnected = true
      }
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          s: string
          c: string
          P: string
          q: string
          h: string
          l: string
        }
        this.price = Number(data.c)
        this.priceUpdatedAt = Date.now()
        this.ticker = {
          symbol: data.s,
          priceChangePercent: Number(data.P),
          quoteVolume: Number(data.q),
          highPrice: Number(data.h),
          lowPrice: Number(data.l),
        }
      }
      socket.onerror = () => {
        this.tickerConnected = false
      }
      socket.onclose = () => {
        if (tickerSocket !== socket) return
        this.tickerConnected = false
        tickerReconnectTimer = window.setTimeout(() => this.startTickerStream(), 3000)
      }
    },
    startPricePolling() {
      if (pricePollTimer) window.clearInterval(pricePollTimer)
      if (tickerPollTimer) window.clearInterval(tickerPollTimer)

      pricePollTimer = window.setInterval(() => {
        void this.fetchPrice()
      }, 1000)
      tickerPollTimer = window.setInterval(() => {
        void this.fetchTicker()
      }, 5000)
    },
    startFundingStream() {
      const previousSocket = fundingSocket
      fundingSocket = null
      previousSocket?.close()
      if (fundingReconnectTimer) window.clearTimeout(fundingReconnectTimer)

      const socket = new WebSocket(`wss://fstream.binance.com/ws/${this.symbol.toLowerCase()}@markPrice@1s`)
      fundingSocket = socket
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as { r: string; T: number }
        this.funding = {
          fundingRate: Number(data.r),
          nextFundingTime: Number(data.T),
        }
        this.updateFundingCountdown()
      }
      socket.onclose = () => {
        if (fundingSocket !== socket) return
        fundingReconnectTimer = window.setTimeout(() => this.startFundingStream(), 3000)
      }
    },
    startFundingRealtime() {
      if (fundingRefreshTimer) window.clearInterval(fundingRefreshTimer)
      if (fundingCountdownTimer) window.clearInterval(fundingCountdownTimer)

      this.startFundingStream()
      this.updateFundingCountdown()
      fundingCountdownTimer = window.setInterval(() => this.updateFundingCountdown(), 1000)
      fundingRefreshTimer = window.setInterval(() => {
        void this.fetchFundingRate()
      }, 60_000)
    },
    startRealtime() {
      this.startTickerStream()
      this.startPricePolling()
      this.startFundingRealtime()
    },
    stopRealtime() {
      tickerSocket?.close()
      fundingSocket?.close()
      tickerSocket = null
      fundingSocket = null
      this.tickerConnected = false

      if (tickerReconnectTimer) window.clearTimeout(tickerReconnectTimer)
      if (fundingReconnectTimer) window.clearTimeout(fundingReconnectTimer)
      if (pricePollTimer) window.clearInterval(pricePollTimer)
      if (tickerPollTimer) window.clearInterval(tickerPollTimer)
      if (fundingRefreshTimer) window.clearInterval(fundingRefreshTimer)
      if (fundingCountdownTimer) window.clearInterval(fundingCountdownTimer)

      tickerReconnectTimer = null
      fundingReconnectTimer = null
      pricePollTimer = null
      tickerPollTimer = null
      fundingRefreshTimer = null
      fundingCountdownTimer = null
    },
    restartRealtime() {
      this.stopRealtime()
      this.startRealtime()
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
