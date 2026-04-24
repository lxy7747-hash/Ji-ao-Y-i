import type { Direction } from './analysis'

export interface RiskInput {
  balance: number
  riskPercent: number
  leverage: number
  direction: Direction
  entryPrice: number
  stopLoss: number
  takeProfit: number
}

export interface RiskResult {
  maxLoss: number
  positionValue: number
  marginRequired: number
  riskRewardRatio: number
  estimatedLiquidationPrice: number
  riskStatus: '低风险' | '中风险' | '高风险' | '参数不足'
}

export interface TradePlan {
  direction: Direction
  entryCondition: string
  entryRange: string
  stopLoss: number
  takeProfit: number
  positionSuggestion: string
  invalidation: string
  riskNotes: string[]
}
