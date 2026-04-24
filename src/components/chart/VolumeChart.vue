<script setup lang="ts">
import { createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Kline } from '../../types/market'

const props = defineProps<{ klines: Kline[] }>()
const container = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null

function resizeChart() {
  if (!chart || !container.value) return
  chart.applyOptions({ width: container.value.clientWidth, height: container.value.clientHeight })
}

function renderChart() {
  if (!chart || !volumeSeries) return
  volumeSeries.setData(props.klines.map((item) => ({
    time: item.time as UTCTimestamp,
    value: item.volume,
    color: item.close >= item.open ? '#34d39988' : '#fb718588',
  })))
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
  })
  volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceLineVisible: false })
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
  <section class="panel rounded-lg p-4">
    <h2 class="mb-3 text-base font-semibold text-slate-100">成交量</h2>
    <div ref="container" class="h-[180px] w-full" />
  </section>
</template>
