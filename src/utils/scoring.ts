import type { AnalysisResult, IndicatorSnapshot } from '../types/analysis'
import type { Kline } from '../types/market'

export function scoreMarket(klines: Kline[], indicators: IndicatorSnapshot): AnalysisResult {
  const latest = klines.at(-1)
  if (!latest) {
    return {
      trend: '无数据',
      momentum: '无数据',
      volatility: '无数据',
      longScore: 0,
      shortScore: 0,
      direction: 'wait',
      confidence: 0,
      reasons: ['行情数据不足，暂不生成计划'],
    }
  }

  let longScore = 0
  let shortScore = 0
  const reasons: string[] = []

  if (latest.close > indicators.ema20 && indicators.ema20 > indicators.ema60) {
    longScore += 30
    reasons.push('价格位于 EMA20 上方，短线趋势偏多')
  } else if (latest.close < indicators.ema20 && indicators.ema20 < indicators.ema60) {
    shortScore += 30
    reasons.push('价格位于 EMA20 下方，短线趋势偏空')
  }

  if (indicators.ema60 > indicators.ema120) longScore += 18
  if (indicators.ema60 < indicators.ema120) shortScore += 18

  if (indicators.rsi > 55 && indicators.rsi < 72) {
    longScore += 18
    reasons.push('RSI 处于偏强区间但未明显过热')
  } else if (indicators.rsi < 45 && indicators.rsi > 28) {
    shortScore += 18
    reasons.push('RSI 处于偏弱区间但未明显超卖')
  } else if (indicators.rsi >= 72) {
    shortScore += 10
    reasons.push('RSI 过热，追多风险上升')
  } else if (indicators.rsi <= 28) {
    longScore += 10
    reasons.push('RSI 超卖，追空风险上升')
  }

  if (indicators.macd.histogram > 0) longScore += 16
  if (indicators.macd.histogram < 0) shortScore += 16

  const previous = klines.at(-2)
  if (previous && latest.volume > indicators.volumeAverage * 1.15) {
    if (latest.close > previous.close) longScore += 10
    if (latest.close < previous.close) shortScore += 10
    reasons.push('最新成交量高于 20 根均量，价格变化更有参考价值')
  }

  const atrPercent = latest.close ? indicators.atr / latest.close : 0
  const volatility = atrPercent > 0.035 ? '高波动' : atrPercent > 0.018 ? '中等波动' : '低波动'
  if (volatility === '高波动') {
    longScore -= 6
    shortScore -= 6
    reasons.push('ATR 显示波动偏高，需要降低仓位')
  }

  const gap = Math.abs(longScore - shortScore)
  const direction = gap < 15 ? 'wait' : longScore > shortScore ? 'long' : 'short'
  const confidence = Math.min(95, Math.max(0, 50 + gap))

  return {
    trend: latest.close > indicators.ema60 ? '上行结构' : latest.close < indicators.ema60 ? '下行结构' : '震荡结构',
    momentum: indicators.macd.histogram > 0 ? '动能偏多' : indicators.macd.histogram < 0 ? '动能偏空' : '动能中性',
    volatility,
    longScore: Math.max(0, Math.round(longScore)),
    shortScore: Math.max(0, Math.round(shortScore)),
    direction,
    confidence: direction === 'wait' ? Math.min(confidence, 55) : confidence,
    reasons: reasons.length ? reasons : ['信号不够集中，建议等待更明确结构'],
  }
}
