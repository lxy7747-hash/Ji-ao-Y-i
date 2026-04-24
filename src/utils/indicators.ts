import type { IndicatorSnapshot, MacdPoint } from '../types/analysis'
import type { Kline } from '../types/market'

const round = (value: number, decimals = 2) => Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0

export function ema(values: number[], period: number): number[] {
  if (!values.length) return []
  const multiplier = 2 / (period + 1)
  const result = [values[0]]
  for (let index = 1; index < values.length; index += 1) {
    result.push((values[index] - result[index - 1]) * multiplier + result[index - 1])
  }
  return result
}

export function rsi(values: number[], period = 14): number {
  if (values.length <= period) return 50
  let gains = 0
  let losses = 0
  for (let index = values.length - period; index < values.length; index += 1) {
    const change = values[index] - values[index - 1]
    if (change >= 0) gains += change
    else losses += Math.abs(change)
  }
  if (losses === 0) return 100
  return round(100 - 100 / (1 + gains / losses), 2)
}

export function macd(values: number[]): MacdPoint {
  if (values.length < 35) return { macd: 0, signal: 0, histogram: 0 }
  const ema12 = ema(values, 12)
  const ema26 = ema(values, 26)
  const diffs = ema12.map((value, index) => value - ema26[index])
  const signalSeries = ema(diffs, 9)
  const latestMacd = diffs.at(-1) ?? 0
  const signal = signalSeries.at(-1) ?? 0
  return {
    macd: round(latestMacd, 4),
    signal: round(signal, 4),
    histogram: round(latestMacd - signal, 4),
  }
}

export function atr(klines: Kline[], period = 14): number {
  if (klines.length <= period) return 0
  const trueRanges = klines.slice(1).map((kline, index) => {
    const previousClose = klines[index].close
    return Math.max(
      kline.high - kline.low,
      Math.abs(kline.high - previousClose),
      Math.abs(kline.low - previousClose),
    )
  })
  const recent = trueRanges.slice(-period)
  return round(recent.reduce((sum, value) => sum + value, 0) / recent.length, 2)
}

export function calculateIndicators(klines: Kline[]): IndicatorSnapshot {
  const closes = klines.map((item) => item.close)
  const volumes = klines.map((item) => item.volume)
  const ema20 = ema(closes, 20).at(-1) ?? 0
  const ema60 = ema(closes, 60).at(-1) ?? 0
  const ema120 = ema(closes, 120).at(-1) ?? 0
  const recentVolumes = volumes.slice(-20)

  return {
    ema20: round(ema20, 2),
    ema60: round(ema60, 2),
    ema120: round(ema120, 2),
    rsi: rsi(closes),
    macd: macd(closes),
    atr: atr(klines),
    volumeAverage: round(recentVolumes.reduce((sum, value) => sum + value, 0) / Math.max(recentVolumes.length, 1), 2),
  }
}
