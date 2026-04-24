import type { RiskInput, RiskResult } from '../types/risk'

const round = (value: number, decimals = 2) => Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0

export function calculateRisk(input: RiskInput): RiskResult {
  const { balance, riskPercent, leverage, direction, entryPrice, stopLoss, takeProfit } = input
  const maxLoss = balance * (riskPercent / 100)
  const stopDistance = Math.abs(entryPrice - stopLoss)
  const rewardDistance = Math.abs(takeProfit - entryPrice)

  if (!balance || !riskPercent || !leverage || !entryPrice || !stopLoss || !takeProfit || stopDistance === 0 || direction === 'wait') {
    return {
      maxLoss: round(maxLoss),
      positionValue: 0,
      marginRequired: 0,
      riskRewardRatio: 0,
      estimatedLiquidationPrice: 0,
      riskStatus: '参数不足',
    }
  }

  const quantity = maxLoss / stopDistance
  const positionValue = quantity * entryPrice
  const marginRequired = positionValue / leverage
  const riskRewardRatio = rewardDistance / stopDistance
  const liquidationBuffer = entryPrice / leverage
  const estimatedLiquidationPrice = direction === 'long'
    ? entryPrice - liquidationBuffer
    : entryPrice + liquidationBuffer

  const riskStatus = leverage >= 20 || riskPercent > 3 || riskRewardRatio < 1.2
    ? '高风险'
    : leverage >= 10 || riskPercent > 1.5 || riskRewardRatio < 1.8
      ? '中风险'
      : '低风险'

  return {
    maxLoss: round(maxLoss),
    positionValue: round(positionValue),
    marginRequired: round(marginRequired),
    riskRewardRatio: round(riskRewardRatio, 2),
    estimatedLiquidationPrice: round(estimatedLiquidationPrice),
    riskStatus,
  }
}
