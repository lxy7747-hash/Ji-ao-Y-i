<script setup lang="ts">
import type { AnalysisResult } from '../../types/analysis'

defineProps<{ analysis: AnalysisResult }>()
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">多空评分</h2>
      <span
        class="rounded px-2 py-1 text-xs font-semibold"
        :class="{
          'bg-emerald-400/15 text-emerald-200': analysis.direction === 'long',
          'bg-rose-400/15 text-rose-200': analysis.direction === 'short',
          'bg-slate-700 text-slate-200': analysis.direction === 'wait',
        }"
      >
        {{ analysis.direction === 'long' ? '偏多' : analysis.direction === 'short' ? '偏空' : '观望' }}
      </span>
    </div>
    <div class="mt-3 space-y-2">
      <div>
        <div class="mb-1 flex justify-between text-xs text-slate-400"><span>多头</span><span>{{ analysis.longScore }}</span></div>
        <div class="h-2 rounded bg-slate-800"><div class="h-2 rounded bg-emerald-400" :style="{ width: `${Math.min(100, analysis.longScore)}%` }" /></div>
      </div>
      <div>
        <div class="mb-1 flex justify-between text-xs text-slate-400"><span>空头</span><span>{{ analysis.shortScore }}</span></div>
        <div class="h-2 rounded bg-slate-800"><div class="h-2 rounded bg-rose-400" :style="{ width: `${Math.min(100, analysis.shortScore)}%` }" /></div>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="metric-label">置信度</span>
        <span class="font-semibold text-slate-50">{{ analysis.confidence }}%</span>
      </div>
    </div>
    <ul class="mt-3 min-h-0 flex-1 space-y-1 overflow-hidden text-xs text-slate-300">
      <li v-for="reason in analysis.reasons.slice(0, 4)" :key="reason" class="border-l border-cyan-400/50 pl-2 leading-5">{{ reason }}</li>
    </ul>
  </section>
</template>
