<script setup lang="ts">
import type { TimeframeConsensus } from '../../types/analysis'

defineProps<{ consensus: TimeframeConsensus }>()
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">多周期共振</h2>
      <span class="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">{{ consensus.agreement }}%</span>
    </div>
    <p class="mt-2 text-xs leading-5 text-slate-300">{{ consensus.summary }}</p>
    <div class="mt-3 grid gap-2">
      <div v-for="item in consensus.items" :key="item.interval" class="grid grid-cols-[42px_1fr_46px] items-center gap-2 rounded border border-line bg-slate-900 px-2 py-2 text-xs">
        <span class="font-semibold text-slate-100">{{ item.interval }}</span>
        <span class="truncate text-slate-400">{{ item.trend }}</span>
        <span
          class="text-right font-semibold"
          :class="{
            'text-emerald-300': item.direction === 'long',
            'text-rose-300': item.direction === 'short',
            'text-slate-400': item.direction === 'wait',
          }"
        >
          {{ item.direction === 'long' ? '偏多' : item.direction === 'short' ? '偏空' : '观望' }}
        </span>
      </div>
    </div>
  </section>
</template>
