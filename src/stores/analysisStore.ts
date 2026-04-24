import { defineStore } from 'pinia'
import { calculateIndicators } from '../utils/indicators'
import { scoreMarket } from '../utils/scoring'
import type { AnalysisResult, IndicatorSnapshot } from '../types/analysis'
import type { Kline } from '../types/market'

const emptyIndicators = (): IndicatorSnapshot => ({
  ema20: 0,
  ema60: 0,
  ema120: 0,
  rsi: 50,
  macd: { macd: 0, signal: 0, histogram: 0 },
  atr: 0,
  volumeAverage: 0,
})

const emptyAnalysis = (): AnalysisResult => ({
  trend: '无数据',
  momentum: '无数据',
  volatility: '无数据',
  longScore: 0,
  shortScore: 0,
  direction: 'wait',
  confidence: 0,
  reasons: ['等待行情数据加载'],
})

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    indicators: emptyIndicators(),
    analysis: emptyAnalysis(),
  }),
  actions: {
    calculateIndicators(klines: Kline[]) {
      this.indicators = calculateIndicators(klines)
    },
    calculateScore(klines: Kline[]) {
      this.analysis = scoreMarket(klines, this.indicators)
    },
    generateAnalysis(klines: Kline[]) {
      this.calculateIndicators(klines)
      this.calculateScore(klines)
    },
  },
})
