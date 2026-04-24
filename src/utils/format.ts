export const formatPrice = (value: number) => Number.isFinite(value)
  ? value.toLocaleString('en-US', { maximumFractionDigits: value > 100 ? 2 : 6 })
  : '--'

export const formatPercent = (value: number) => Number.isFinite(value)
  ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  : '--'

export const formatCompact = (value: number) => Number.isFinite(value)
  ? Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
  : '--'

export const formatDateTime = (value: number) => value
  ? new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(value)
  : '--'
