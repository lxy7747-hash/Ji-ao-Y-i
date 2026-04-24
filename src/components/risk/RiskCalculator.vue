<script setup lang="ts">
import { watch } from 'vue'
import type { RiskResult } from '../../types/risk'
import { formatPrice } from '../../utils/format'

const props = defineProps<{
  balance: number
  riskPercent: number
  leverage: number
  result: RiskResult
}>()

const emit = defineEmits<{
  'update:balance': [value: number]
  'update:riskPercent': [value: number]
  'update:leverage': [value: number]
  calculate: []
  reset: []
}>()

watch(() => [props.balance, props.riskPercent, props.leverage], () => emit('calculate'))
</script>

<template>
  <section class="panel flex h-full flex-col rounded p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">风控计算器</h2>
      <button class="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-slate-800" @click="emit('reset')">重置</button>
    </div>
    <div class="mt-2 grid grid-cols-3 gap-2">
      <label class="text-xs text-slate-300">
        权益
        <input class="mt-1 h-8 w-full rounded border border-line bg-slate-900 px-2 outline-none focus:border-cyan-400" type="number" min="0" :value="balance" @input="emit('update:balance', Number(($event.target as HTMLInputElement).value))" />
      </label>
      <label class="text-xs text-slate-300">
        风险 %
        <input class="mt-1 h-8 w-full rounded border border-line bg-slate-900 px-2 outline-none focus:border-cyan-400" type="number" min="0.1" step="0.1" :value="riskPercent" @input="emit('update:riskPercent', Number(($event.target as HTMLInputElement).value))" />
      </label>
      <label class="text-xs text-slate-300">
        杠杆
        <input class="mt-1 h-8 w-full rounded border border-line bg-slate-900 px-2 outline-none focus:border-cyan-400" type="number" min="1" step="1" :value="leverage" @input="emit('update:leverage', Number(($event.target as HTMLInputElement).value))" />
      </label>
    </div>
    <div class="mt-3 grid flex-1 grid-cols-2 gap-2 text-xs">
      <div><div class="metric-label">最大亏损</div><div class="font-semibold text-slate-50">{{ formatPrice(result.maxLoss) }}</div></div>
      <div><div class="metric-label">仓位价值</div><div class="font-semibold text-slate-50">{{ formatPrice(result.positionValue) }}</div></div>
      <div><div class="metric-label">保证金</div><div class="font-semibold text-slate-50">{{ formatPrice(result.marginRequired) }}</div></div>
      <div><div class="metric-label">盈亏比</div><div class="font-semibold text-slate-50">{{ result.riskRewardRatio }}</div></div>
      <div class="col-span-2"><div class="metric-label">预估强平</div><div class="font-semibold text-slate-50">{{ formatPrice(result.estimatedLiquidationPrice) }}</div></div>
    </div>
  </section>
</template>
