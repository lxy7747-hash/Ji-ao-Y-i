<script setup lang="ts">
import type { IndicatorSnapshot } from '../../types/analysis'
import { formatPrice } from '../../utils/format'

defineProps<{ indicators: IndicatorSnapshot; trend: string; momentum: string; volatility: string }>()
</script>

<template>
  <section class="panel rounded-lg p-4">
    <h2 class="text-base font-semibold text-slate-100">技术指标</h2>
    <div class="mt-4 grid grid-cols-2 gap-3">
      <div><div class="metric-label">EMA20</div><div class="metric-value">{{ formatPrice(indicators.ema20) }}</div></div>
      <div><div class="metric-label">EMA60</div><div class="metric-value">{{ formatPrice(indicators.ema60) }}</div></div>
      <div><div class="metric-label">EMA120</div><div class="metric-value">{{ formatPrice(indicators.ema120) }}</div></div>
      <div><div class="metric-label">RSI</div><div class="metric-value">{{ indicators.rsi }}</div></div>
      <div><div class="metric-label">MACD 柱</div><div class="metric-value">{{ indicators.macd.histogram }}</div></div>
      <div><div class="metric-label">ATR</div><div class="metric-value">{{ formatPrice(indicators.atr) }}</div></div>
    </div>
    <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
      <span class="rounded border border-line bg-slate-900 px-2 py-2 text-slate-300">{{ trend }}</span>
      <span class="rounded border border-line bg-slate-900 px-2 py-2 text-slate-300">{{ momentum }}</span>
      <span class="rounded border border-line bg-slate-900 px-2 py-2 text-slate-300">{{ volatility }}</span>
    </div>
  </section>
</template>
