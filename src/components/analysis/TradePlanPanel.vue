<script setup lang="ts">
import type { TradePlan } from '../../types/risk'
import { formatPrice } from '../../utils/format'

defineProps<{ plan: TradePlan }>()
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">交易计划</h2>
      <span class="text-xs text-slate-400">{{ plan.direction === 'long' ? '做多计划' : plan.direction === 'short' ? '做空计划' : '观望' }}</span>
    </div>
    <div class="mt-3 grid gap-3 text-xs">
      <div><div class="metric-label">入场条件</div><div class="mt-1 leading-5 text-slate-100">{{ plan.entryCondition }}</div></div>
      <div class="grid grid-cols-2 gap-3">
        <div><div class="metric-label">入场区间</div><div class="mt-1 text-slate-100">{{ plan.entryRange }}</div></div>
        <div><div class="metric-label">仓位建议</div><div class="mt-1 leading-5 text-slate-100">{{ plan.positionSuggestion }}</div></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><div class="metric-label">止损</div><div class="mt-1 text-rose-200">{{ formatPrice(plan.stopLoss) }}</div></div>
        <div><div class="metric-label">止盈</div><div class="mt-1 text-emerald-200">{{ formatPrice(plan.takeProfit) }}</div></div>
      </div>
      <div><div class="metric-label">失效条件</div><div class="mt-1 leading-5 text-slate-100">{{ plan.invalidation }}</div></div>
    </div>
    <ul class="mt-3 space-y-1 overflow-hidden text-xs text-amber-100">
      <li v-for="note in plan.riskNotes.slice(0, 2)" :key="note" class="truncate">{{ note }}</li>
    </ul>
  </section>
</template>
