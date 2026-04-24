<script setup lang="ts">
import { createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Kline } from '../../types/market'
import { ema } from '../../utils/indicators'

const props = defineProps<{ klines: Kline[] }>()

const container = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null
let ema20Series: ISeriesApi<'Line'> | null = null
let ema60Series: ISeriesApi<'Line'> | null = null

const hasData = computed(() => props.klines.length > 0)

function resizeChart() {
  if (!chart || !container.value) return
  chart.applyOptions({ width: container.value.clientWidth, height: container.value.clientHeight })
}

function renderChart() {
  if (!chart || !candleSeries || !volumeSeries || !ema20Series || !ema60Series) return
  const closes = props.klines.map((item) => item.close)
  const ema20 = ema(closes, 20)
  const ema60 = ema(closes, 60)

  candleSeries.setData(props.klines.map((item) => ({
    time: item.time as UTCTimestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  })))
  volumeSeries.setData(props.klines.map((item) => ({
    time: item.time as UTCTimestamp,
    value: item.volume,
    color: item.close >= item.open ? '#34d39966' : '#fb718566',
  })))
  ema20Series.setData(props.klines.map((item, index) => ({ time: item.time as UTCTimestamp, value: ema20[index] })))
  ema60Series.setData(props.klines.map((item, index) => ({ time: item.time as UTCTimestamp, value: ema60[index] })))
  chart.timeScale().fitContent()
}

onMounted(async () => {
  await nextTick()
  if (!container.value) return
  chart = createChart(container.value, {
    width: container.value.clientWidth,
    height: container.value.clientHeight,
    layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
    grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
    rightPriceScale: { borderColor: '#334155' },
    timeScale: { borderColor: '#334155', timeVisible: true },
    crosshair: { mode: 1 },
  })
  candleSeries = chart.addCandlestickSeries({
    upColor: '#34d399',
    downColor: '#fb7185',
    borderVisible: false,
    wickUpColor: '#34d399',
    wickDownColor: '#fb7185',
    priceScaleId: 'right',
  })
  chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.24 } })
  volumeSeries = chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceLineVisible: false,
    priceScaleId: '',
  })
  chart.priceScale('').applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } })
  ema20Series = chart.addLineSeries({ color: '#22d3ee', lineWidth: 2, priceLineVisible: false })
  ema60Series = chart.addLineSeries({ color: '#fbbf24', lineWidth: 2, priceLineVisible: false })
  renderChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => props.klines, renderChart, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.remove()
})
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">K线 / 成交量 / EMA</h2>
      <div class="flex gap-3 text-xs text-slate-400">
        <span class="text-cyan-300">EMA20</span>
        <span class="text-amber-300">EMA60</span>
        <span class="text-slate-300">Volume</span>
      </div>
    </div>
    <div ref="container" class="min-h-0 flex-1 w-full" />
    <div v-if="!hasData" class="flex min-h-0 flex-1 items-center justify-center text-sm text-slate-500">等待行情数据</div>
  </section>
</template>
