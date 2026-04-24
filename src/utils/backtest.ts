import type { BacktestResult } from '../types/analysis'
import type { Kline } from '../types/market'
import { calculateIndicators } from './indicators'
import { scoreMarket } from './scoring'

const round = (value: number, decimals = 2) => Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0

export function runSimpleBacktest(klines: Kline[]): BacktestResult {
  if (klines.length < 80) {
    return { trades: 0, wins: 0, losses: 0, winRate: 0, totalReturnPercent: 0, maxDrawdownPercent: 0, profitFactor: 0 }
  }

  let wins = 0
  let losses = 0
  let grossProfit = 0
  let grossLoss = 0
  let equity = 100
  let peak = 100
  let maxDrawdown = 0

  for (let index = 60; index < klines.length - 6; index += 6) {
    const window = klines.slice(0, index)
    const indicators = calculateIndicators(window)
    const analysis = scoreMarket(window, indicators)
    if (analysis.direction === 'wait' || analysis.confidence < 65) continue

    const entry = klines[index].close
    const exit = klines[index + 6].close
    const rawReturn = analysis.direction === 'long'
      ? (exit - entry) / entry
      : (entry - exit) / entry
    const tradeReturn = rawReturn * 100

    equity *= 1 + tradeReturn / 100
    peak = Math.max(peak, equity)
    maxDrawdown = Math.max(maxDrawdown, ((peak - equity) / peak) * 100)

    if (tradeReturn > 0) {
      wins += 1
      grossProfit += tradeReturn
    } else {
      losses += 1
      grossLoss += Math.abs(tradeReturn)
    }
  }

  const trades = wins + losses
  return {
    trades,
    wins,
    losses,
    winRate: trades ? round((wins / trades) * 100) : 0,
    totalReturnPercent: round(equity - 100),
    maxDrawdownPercent: round(maxDrawdown),
    profitFactor: grossLoss ? round(grossProfit / grossLoss, 2) : grossProfit > 0 ? 99 : 0,
  }
}
