import type { PriceLevel, StructureAnalysis } from '../types/analysis'
import type { Kline } from '../types/market'

const round = (value: number) => Number.isFinite(value) ? Number(value.toFixed(2)) : 0

function clusterLevels(levels: number[], latestPrice: number): PriceLevel[] {
  if (!latestPrice || !levels.length) return []
  const tolerance = latestPrice * 0.004
  const clusters: number[][] = []

  levels.sort((a, b) => a - b).forEach((level) => {
    const bucket = clusters.find((items) => Math.abs((items.reduce((sum, item) => sum + item, 0) / items.length) - level) <= tolerance)
    if (bucket) bucket.push(level)
    else clusters.push([level])
  })

  return clusters
    .map((items) => {
      const price = items.reduce((sum, item) => sum + item, 0) / items.length
      const touches = items.length
      return {
        price: round(price),
        touches,
        distancePercent: round(((price - latestPrice) / latestPrice) * 100),
        strength: touches >= 4 ? 'strong' : touches >= 2 ? 'medium' : 'weak',
      } satisfies PriceLevel
    })
    .filter((level) => level.touches >= 2)
}

export function analyzeStructure(klines: Kline[]): StructureAnalysis {
  const latest = klines.at(-1)
  if (!latest) return { supports: [], resistances: [] }

  const slice = klines.slice(-160)
  const lows: number[] = []
  const highs: number[] = []

  for (let index = 2; index < slice.length - 2; index += 1) {
    const current = slice[index]
    if (current.low <= slice[index - 1].low && current.low <= slice[index - 2].low && current.low <= slice[index + 1].low && current.low <= slice[index + 2].low) {
      lows.push(current.low)
    }
    if (current.high >= slice[index - 1].high && current.high >= slice[index - 2].high && current.high >= slice[index + 1].high && current.high >= slice[index + 2].high) {
      highs.push(current.high)
    }
  }

  const supports = clusterLevels(lows, latest.close)
    .filter((level) => level.price < latest.close)
    .sort((a, b) => Math.abs(a.distancePercent) - Math.abs(b.distancePercent))
    .slice(0, 4)

  const resistances = clusterLevels(highs, latest.close)
    .filter((level) => level.price > latest.close)
    .sort((a, b) => Math.abs(a.distancePercent) - Math.abs(b.distancePercent))
    .slice(0, 4)

  return {
    supports,
    resistances,
    nearestSupport: supports[0],
    nearestResistance: resistances[0],
  }
}
