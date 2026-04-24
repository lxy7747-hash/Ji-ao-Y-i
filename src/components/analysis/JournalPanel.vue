<script setup lang="ts">
import { ref } from 'vue'
import type { AnalysisRecord, ReviewLog } from '../../types/analysis'
import { formatDateTime, formatPrice } from '../../utils/format'

defineProps<{ records: AnalysisRecord[]; reviews: ReviewLog[]; symbol: string }>()

const emit = defineEmits<{
  saveRecord: []
  addReview: [title: string, content: string]
  exportReport: []
}>()

const title = ref('')
const content = ref('')

function submitReview() {
  emit('addReview', title.value, content.value)
  title.value = ''
  content.value = ''
}
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div class="panel rounded-lg p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-base font-semibold text-slate-100">分析记录</h2>
        <div class="flex gap-2">
          <button class="rounded border border-line px-3 py-1 text-xs text-slate-300 hover:bg-slate-800" @click="emit('saveRecord')">保存当前</button>
          <button class="rounded border border-cyan-500/50 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-500/10" @click="emit('exportReport')">导出 Markdown</button>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        <div v-for="record in records.slice(0, 6)" :key="record.id" class="rounded border border-line bg-slate-900 p-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-100">{{ record.symbol }} {{ record.interval }}</span>
            <span class="text-xs text-slate-500">{{ formatDateTime(record.createdAt) }}</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-slate-300 md:grid-cols-4">
            <span>价格 {{ formatPrice(record.price) }}</span>
            <span>方向 {{ record.direction }}</span>
            <span>置信 {{ record.confidence }}%</span>
            <span>评分 {{ record.longScore }}/{{ record.shortScore }}</span>
          </div>
        </div>
        <div v-if="!records.length" class="text-sm text-slate-500">暂无记录</div>
      </div>
    </div>

    <div class="panel rounded-lg p-4">
      <h2 class="text-base font-semibold text-slate-100">复盘日志</h2>
      <div class="mt-3 space-y-2">
        <input v-model="title" class="h-10 w-full rounded border border-line bg-slate-900 px-3 text-sm outline-none focus:border-cyan-400" placeholder="标题" />
        <textarea v-model="content" class="min-h-24 w-full resize-y rounded border border-line bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-400" placeholder="记录交易想法、执行结果或复盘结论" />
        <button class="w-full rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" @click="submitReview">保存复盘</button>
      </div>
      <div class="mt-4 space-y-2">
        <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="rounded border border-line bg-slate-900 p-3 text-sm">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-slate-100">{{ review.title }}</span>
            <span class="text-xs text-slate-500">{{ formatDateTime(review.createdAt) }}</span>
          </div>
          <p class="mt-1 text-slate-400">{{ review.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
