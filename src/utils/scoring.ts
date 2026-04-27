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
      reasons: ['行情数据不足，暂不生成建议'],
    }
  }

  let longScore = 0
  let shortScore = 0
  const reasons: string[] = []
  const previous = klines.at(-2)
  const recentWindow = klines.slice(-8)
  const recentHigh = recentWindow.length ? Math.max(...recentWindow.map((item) => item.high)) : latest.high
  const recentLow = recentWindow.length ? Math.min(...recentWindow.map((item) => item.low)) : latest.low
  const candleRange = Math.max(latest.high - latest.low, latest.close * 0.001)
  const bodySize = Math.abs(latest.close - latest.open)
  const bodyRatio = bodySize / candleRange
  const upperWick = latest.high - Math.max(latest.open, latest.close)
  const lowerWick = Math.min(latest.open, latest.close) - latest.low
  const volumeRatio = indicators.volumeAverage > 0 ? latest.volume / indicators.volumeAverage : 1
  const closedAboveVegas = latest.close > indicators.vegasUpper
  const closedBelowVegas = latest.close < indicators.vegasLower

  if (closedAboveVegas) {
    longScore += 24
    reasons.push('收盘站上维加斯通道，上方趋势保持主导')
  } else if (closedBelowVegas) {
    shortScore += 24
    reasons.push('收盘跌破维加斯通道，下方压制仍在延续')
  } else {
    longScore -= 4
    shortScore -= 4
    reasons.push('价格运行在维加斯通道内部，方向仍偏整理')
  }

  if (previous) {
    const brokeRecentHigh = latest.close > recentHigh * 0.998 && latest.high >= recentHigh
    const brokeRecentLow = latest.close < recentLow * 1.002 && latest.low <= recentLow
    const bullishClose = latest.close > latest.open && latest.close > previous.high
    const bearishClose = latest.close < latest.open && latest.close < previous.low
    const bullishRejection = lowerWick > bodySize * 1.1 && latest.close > latest.open
    const bearishRejection = upperWick > bodySize * 1.1 && latest.close < latest.open

    if (bullishClose || (brokeRecentHigh && bodyRatio > 0.55)) {
      longScore += 26
      reasons.push('裸K出现向上突破收盘，买盘主动性增强')
    }

    if (bearishClose || (brokeRecentLow && bodyRatio > 0.55)) {
      shortScore += 26
      reasons.push('裸K出现向下破位收盘，卖盘主动性增强')
    }

    if (bullishRejection && latest.close >= indicators.vegasMid) {
      longScore += 18
      reasons.push('下影明显且收回关键区域，低位承接较强')
    }

    if (bearishRejection && latest.close <= indicators.vegasMid) {
      shortScore += 18
      reasons.push('上影明显且再度回落，追价资金承接不足')
    }
  }

  if (volumeRatio >= 1.35) {
    if (latest.close > latest.open) {
      longScore += 18
      reasons.push('放量阳线配合上攻，量价关系支持继续偏多')
    } else if (latest.close < latest.open) {
      shortScore += 18
      reasons.push('放量阴线伴随下压，量价关系支持继续偏空')
    }
  } else if (volumeRatio <= 0.85 && bodyRatio < 0.45) {
    longScore -= 6
    shortScore -= 6
    reasons.push('当前量能不足且实体偏短，信号质量一般')
  }

  if (latest.close > indicators.vegasMid && volumeRatio > 1) longScore += 10
  if (latest.close < indicators.vegasMid && volumeRatio > 1) shortScore += 10

  if (indicators.rsi > 72) {
    shortScore += 6
    reasons.push('短线偏热，继续追多需要更好的回踩位置')
  } else if (indicators.rsi < 28) {
    longScore += 6
    reasons.push('短线偏冷，继续追空需要防范快速反抽')
  }

  const atrPercent = latest.close ? indicators.atr / latest.close : 0
  const volatility = atrPercent > 0.035 ? '高波动' : atrPercent > 0.018 ? '中等波动' : '低波动'
  if (volatility === '高波动') {
    longScore -= 6
    shortScore -= 6
    reasons.push('ATR 显示波动偏高，建议等确认后再放大仓位')
  }

  const gap = Math.abs(longScore - shortScore)
  const direction = gap < 15 ? 'wait' : longScore > shortScore ? 'long' : 'short'
  const confidence = Math.min(95, Math.max(0, 50 + gap))

  return {
    trend: closedAboveVegas ? '通道上方运行' : closedBelowVegas ? '通道下方运行' : '通道内整理',
    momentum: volumeRatio >= 1.2
      ? latest.close >= latest.open ? '放量上攻' : '放量下压'
      : bodyRatio >= 0.55
        ? latest.close >= latest.open ? '实体偏强' : '实体偏弱'
        : '观望节奏',
    volatility,
    longScore: Math.max(0, Math.round(longScore)),
    shortScore: Math.max(0, Math.round(shortScore)),
    direction,
    confidence: direction === 'wait' ? Math.min(confidence, 55) : confidence,
    reasons: reasons.length ? reasons : ['裸K和量价暂未形成集中优势，建议等待更明确结构'],
  }
}
