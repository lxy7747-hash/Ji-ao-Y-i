export type TimeInterval = '5m' | '15m' | '1h' | '4h' | '1d'

export interface Kline {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Ticker24h {
  symbol: string
  priceChangePercent: number
  quoteVolume: number
  highPrice: number
  lowPrice: number
}

export interface FundingInfo {
  fundingRate: number
  nextFundingTime: number
}
