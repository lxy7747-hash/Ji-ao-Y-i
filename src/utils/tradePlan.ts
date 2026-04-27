import type { AnalysisResult } from '../types/analysis'
import type { IndicatorSnapshot } from '../types/analysis'
import type { Kline } from '../types/market'
import type { RiskResult, TradePlan } from '../types/risk'

const round = (value: number) => Number.isFinite(value) ? Number(value.toFixed(2)) : 0

export function generateTradePlan(klines: Kline[], indicators: IndicatorSnapshot, analysis: AnalysisResult, risk: RiskResult): TradePlan {
  const latest = klines.at(-1)
  const previous = klines.at(-2)

  if (!latest || analysis.direction === 'wait') {
    return {
      direction: 'wait',
      entryCondition: '等待裸K突破或反包，并配合量价同步确认',
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
  const anchorPrice = isLong
    ? Math.max(indicators.vegasMid, previous?.low ?? latest.low)
    : Math.min(indicators.vegasMid, previous?.high ?? latest.high)
  const entryLow = isLong ? anchorPrice - atr * 0.2 : latest.close - atr * 0.1
  const entryHigh = isLong ? latest.close + atr * 0.15 : anchorPrice + atr * 0.2
  const stopLoss = isLong
    ? Math.min(indicators.vegasLower, latest.low) - atr * 0.45
    : Math.max(indicators.vegasUpper, latest.high) + atr * 0.45
  const riskDistance = Math.max(Math.abs(latest.close - stopLoss), atr * 0.8)
  const takeProfit = isLong ? latest.close + riskDistance * 1.8 : latest.close - riskDistance * 1.8

  return {
    direction: analysis.direction,
    entryCondition: isLong
      ? '优先等回踩维加斯中轨或前一根低点上方，再看放量阳线确认'
      : '优先等反抽维加斯中轨或前一根高点下方，再看放量阴线确认',
    entryRange: `${round(entryLow)} - ${round(entryHigh)}`,
    stopLoss: round(stopLoss),
    takeProfit: round(takeProfit),
    positionSuggestion: risk.marginRequired > 0 ? `保证金约 ${risk.marginRequired} USDT，风险等级：${risk.riskStatus}` : '先填写账户与止损参数',
    invalidation: isLong
      ? `跌回维加斯下轨 ${round(indicators.vegasLower)} 下方且放量转弱，计划失效`
      : `重新站上维加斯上轨 ${round(indicators.vegasUpper)} 上方且放量转强，计划失效`,
    riskNotes: [
      '计划必须包含止损，不做自动交易。',
      analysis.volatility === '高波动' ? '当前波动偏高，建议减半仓位或等待缩量后再参与' : '优先选择量价同步的那一侧，避免在通道中部追价',
    ],
  }
}
