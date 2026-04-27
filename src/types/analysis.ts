export interface MacdPoint {
  macd: number
  signal: number
  histogram: number
}

export interface IndicatorSnapshot {
  vegasUpper: number
  vegasLower: number
  vegasMid: number
  rsi: number
  macd: MacdPoint
  atr: number
  volumeAverage: number
}

export type Direction = 'long' | 'short' | 'wait'

export interface AnalysisResult {
  trend: string
  momentum: string
  volatility: string
  longScore: number
  shortScore: number
  direction: Direction
  confidence: number
  reasons: string[]
}

export interface PriceLevel {
  price: number
  touches: number
  distancePercent: number
  strength: 'weak' | 'medium' | 'strong'
}

export interface StructureAnalysis {
  supports: PriceLevel[]
  resistances: PriceLevel[]
  nearestSupport?: PriceLevel
  nearestResistance?: PriceLevel
}

export interface TimeframeConsensusItem {
  interval: string
  direction: Direction
  trend: string
  confidence: number
}

export interface TimeframeConsensus {
  bias: Direction
  agreement: number
  items: TimeframeConsensusItem[]
  summary: string
}

export interface BacktestResult {
  trades: number
  wins: number
  losses: number
  winRate: number
  totalReturnPercent: number
  maxDrawdownPercent: number
  profitFactor: number
}

export interface AnalysisRecord {
  id: string
  createdAt: number
  symbol: string
  interval: string
  price: number
  direction: Direction
  confidence: number
  longScore: number
  shortScore: number
  notes: string[]
}

export interface ReviewLog {
  id: string
  createdAt: number
  symbol: string
  title: string
  content: string
}
