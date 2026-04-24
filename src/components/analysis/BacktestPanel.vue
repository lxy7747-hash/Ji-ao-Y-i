<script setup lang="ts">
import type { BacktestResult } from '../../types/analysis'

defineProps<{ result: BacktestResult }>()
</script>

<template>
  <section class="panel rounded-lg p-4">
    <h2 class="text-base font-semibold text-slate-100">简易回测</h2>
    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
      <div><div class="metric-label">交易次数</div><div class="metric-value">{{ result.trades }}</div></div>
      <div><div class="metric-label">胜率</div><div class="metric-value">{{ result.winRate }}%</div></div>
      <div><div class="metric-label">累计收益</div><div class="metric-value" :class="result.totalReturnPercent >= 0 ? 'text-emerald-300' : 'text-rose-300'">{{ result.totalReturnPercent }}%</div></div>
      <div><div class="metric-label">最大回撤</div><div class="metric-value">{{ result.maxDrawdownPercent }}%</div></div>
      <div><div class="metric-label">盈亏因子</div><div class="metric-value">{{ result.profitFactor }}</div></div>
    </div>
  </section>
</template>
