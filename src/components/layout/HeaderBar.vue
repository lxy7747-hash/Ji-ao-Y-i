<script setup lang="ts">
import { computed } from 'vue'
import type { TimeInterval } from '../../types/market'
import { formatCompact, formatCountdown, formatDateTime, formatPercent, formatPrice } from '../../utils/format'

const props = defineProps<{
  symbol: string
  interval: TimeInterval
  price: number
  priceUpdatedAt: number
  tickerConnected: boolean
  changePercent: number
  quoteVolume: number
  fundingRate: number
  nextFundingTime: number
  fundingCountdownMs: number
  loading: boolean
}>()

const emit = defineEmits<{
  'update:symbol': [value: string]
  'update:interval': [value: TimeInterval]
  refresh: []
}>()

const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT']
const intervals: TimeInterval[] = ['5m', '15m', '1h', '4h', '1d']
const positive = computed(() => props.changePercent >= 0)
const realtime = computed(() => props.tickerConnected && props.priceUpdatedAt > 0)
</script>

<template>
  <header class="h-16 border-b border-line bg-slate-950/90">
    <div class="flex h-full w-full items-center justify-between gap-3 px-2">
      <div class="flex shrink-0 items-center gap-2">
        <select
          class="h-9 rounded border border-line bg-slate-900 px-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
          :value="symbol"
          @change="emit('update:symbol', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="item in symbols" :key="item" :value="item">{{ item }}</option>
        </select>
        <div class="flex overflow-hidden rounded border border-line bg-slate-900">
          <button
            v-for="item in intervals"
            :key="item"
            class="h-9 min-w-10 px-2 text-xs transition"
            :class="interval === item ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'"
            @click="emit('update:interval', item)"
          >
            {{ item }}
          </button>
        </div>
        <button
          class="h-9 rounded border border-cyan-500/50 px-3 text-xs text-cyan-100 transition hover:bg-cyan-500/10 disabled:cursor-wait disabled:opacity-60"
          :disabled="loading"
          @click="emit('refresh')"
        >
          {{ loading ? '刷新中' : '刷新' }}
        </button>
      </div>

      <div class="grid min-w-0 flex-1 grid-cols-4 gap-2">
        <div class="min-w-0 rounded border border-line bg-slate-900/70 px-2 py-1">
          <div class="flex items-center gap-2">
            <div class="metric-label">当前价格</div>
            <span class="h-1.5 w-1.5 rounded-full" :class="realtime ? 'bg-emerald-400' : 'bg-slate-500'" />
          </div>
          <div class="truncate text-sm font-semibold text-slate-50">{{ formatPrice(price) }}</div>
        </div>
        <div class="min-w-0 rounded border border-line bg-slate-900/70 px-2 py-1">
          <div class="metric-label">24h 涨跌</div>
          <div class="truncate text-sm font-semibold" :class="positive ? 'text-emerald-300' : 'text-rose-300'">
            {{ formatPercent(changePercent) }}
          </div>
        </div>
        <div class="min-w-0 rounded border border-line bg-slate-900/70 px-2 py-1">
          <div class="metric-label">24h 成交额</div>
          <div class="truncate text-sm font-semibold text-slate-50">{{ formatCompact(quoteVolume) }}</div>
        </div>
        <div class="min-w-0 rounded border border-line bg-slate-900/70 px-2 py-1">
          <div class="metric-label">资金费率 / 倒计时</div>
          <div class="truncate text-xs font-semibold text-slate-50" :title="`下次资金费率时间：${formatDateTime(nextFundingTime)}`">
            {{ formatPercent(fundingRate * 100) }} · {{ formatCountdown(fundingCountdownMs) }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
