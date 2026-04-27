export const formatPrice = (value: number) => Number.isFinite(value)
  ? value.toLocaleString('en-US', { maximumFractionDigits: value > 100 ? 4 : 6 })
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

export const formatCountdown = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '00:00:00'
  const totalSeconds = Math.floor(value / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((item) => String(item).padStart(2, '0')).join(':')
}
