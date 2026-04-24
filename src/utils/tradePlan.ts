import type { AnalysisResult } from '../types/analysis'
import type { IndicatorSnapshot } from '../types/analysis'
import type { Kline } from '../types/market'
import type { RiskResult, TradePlan } from '../types/risk'

const round = (value: number) => Number.isFinite(value) ? Number(value.toFixed(2)) : 0

export function generateTradePlan(klines: Kline[], indicators: IndicatorSnapshot, analysis: AnalysisResult, risk: RiskResult): TradePlan {
  const latest = klines.at(-1)
  if (!latest || analysis.direction === 'wait') {
    return {
      direction: 'wait',
      entryCondition: '等待趋势、动能与成交量形成同向确认',
      entryRange: '暂不追单',
      stopLoss: 0,
      takeProfit: 0,
      positionSuggestion: '观望',
      invalidation: '评分差距小于 15 分或接口数据异常',
      riskNotes: ['不生成明确计划时，不建议开仓'],
    }
  }

  const atr = indicators.atr || latest.close * 0.015
  const isLong = analysis.direction === 'long'
  const entryLow = isLong ? latest.close - atr * 0.25 : latest.close - atr * 0.1
  const entryHigh = isLong ? latest.close + atr * 0.1 : latest.close + atr * 0.25
  const stopLoss = isLong ? latest.close - atr * 1.35 : latest.close + atr * 1.35
  const takeProfit = isLong ? latest.close + atr * 2.2 : latest.close - atr * 2.2

  return {
    direction: analysis.direction,
    entryCondition: isLong ? '回踩不破 EMA20 后放量转强' : '反弹不过 EMA20 后放量转弱',
    entryRange: `${round(entryLow)} - ${round(entryHigh)}`,
    stopLoss: round(stopLoss),
    takeProfit: round(takeProfit),
    positionSuggestion: risk.marginRequired > 0 ? `保证金约 ${risk.marginRequired} USDT，风险等级 ${risk.riskStatus}` : '先填写账户与止损参数',
    invalidation: isLong ? `跌破 ${round(stopLoss)} 后多头计划失效` : `突破 ${round(stopLoss)} 后空头计划失效`,
    riskNotes: [
      '计划必须包含止损，不做自动交易',
      analysis.volatility === '高波动' ? '当前波动偏高，建议减半仓位或等待收敛' : '按固定风险比例控制单笔亏损',
    ],
  }
}
