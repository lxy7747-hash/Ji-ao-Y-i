<script setup lang="ts">
import type { StructureAnalysis } from '../../types/analysis'
import { formatPrice } from '../../utils/format'

defineProps<{ structure: StructureAnalysis }>()

const strengthLabel = {
  weak: '弱',
  medium: '中',
  strong: '强',
}
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <h2 class="text-sm font-semibold text-slate-100">支撑压力</h2>
    <div class="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-3 text-xs">
      <div class="min-w-0">
        <div class="metric-label">支撑位</div>
        <div class="mt-2 space-y-2">
          <div v-for="level in structure.supports.slice(0, 3)" :key="`s-${level.price}`" class="flex items-center justify-between gap-2 rounded border border-line bg-slate-900 px-2 py-2">
            <span class="truncate text-emerald-200">{{ formatPrice(level.price) }}</span>
            <span class="shrink-0 text-slate-400">{{ Math.abs(level.distancePercent) }}% / {{ strengthLabel[level.strength] }}</span>
          </div>
          <div v-if="!structure.supports.length" class="text-slate-500">暂无有效支撑</div>
        </div>
      </div>
      <div class="min-w-0">
        <div class="metric-label">压力位</div>
        <div class="mt-2 space-y-2">
          <div v-for="level in structure.resistances.slice(0, 3)" :key="`r-${level.price}`" class="flex items-center justify-between gap-2 rounded border border-line bg-slate-900 px-2 py-2">
            <span class="truncate text-rose-200">{{ formatPrice(level.price) }}</span>
            <span class="shrink-0 text-slate-400">{{ Math.abs(level.distancePercent) }}% / {{ strengthLabel[level.strength] }}</span>
          </div>
          <div v-if="!structure.resistances.length" class="text-slate-500">暂无有效压力</div>
        </div>
      </div>
    </div>
  </section>
</template>
