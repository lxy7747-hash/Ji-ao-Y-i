import type { FundingInfo, Kline, Ticker24h, TimeInterval } from '../types/market'

const BASE_URL = 'https://fapi.binance.com'

async function request<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(path, BASE_URL)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Binance 请求失败：${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function fetchKlines(symbol: string, interval: TimeInterval, limit = 500): Promise<Kline[]> {
  const rows = await request<unknown[][]>('/fapi/v1/klines', { symbol, interval, limit })
  return rows.map((row) => ({
    time: Number(row[0]) / 1000,
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
  }))
}

export async function fetchTicker(symbol: string): Promise<Ticker24h> {
  const data = await request<Record<string, string>>('/fapi/v1/ticker/24hr', { symbol })
  return {
    symbol: data.symbol,
    priceChangePercent: Number(data.priceChangePercent),
    quoteVolume: Number(data.quoteVolume),
    highPrice: Number(data.highPrice),
    lowPrice: Number(data.lowPrice),
  }
}

export async function fetchPrice(symbol: string): Promise<number> {
  const data = await request<{ price: string }>('/fapi/v1/ticker/price', { symbol })
  return Number(data.price)
}

export async function fetchFundingRate(symbol: string): Promise<FundingInfo> {
  const data = await request<{ lastFundingRate: string; nextFundingTime: number }>('/fapi/v1/premiumIndex', { symbol })
  return {
    fundingRate: Number(data.lastFundingRate),
    nextFundingTime: data.nextFundingTime,
  }
}
