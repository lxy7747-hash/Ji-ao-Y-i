<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import HeaderBar from './HeaderBar.vue'
import ConsensusPanel from '../analysis/ConsensusPanel.vue'
import ScorePanel from '../analysis/ScorePanel.vue'
import StructurePanel from '../analysis/StructurePanel.vue'
import TradePlanPanel from '../analysis/TradePlanPanel.vue'
import KlineChart from '../chart/KlineChart.vue'
import RiskCalculator from '../risk/RiskCalculator.vue'
import { useAnalysisStore } from '../../stores/analysisStore'
import { useMarketStore } from '../../stores/marketStore'
import { useRiskStore } from '../../stores/riskStore'
import { analyzeStructure } from '../../utils/structure'
import { generateTradePlan } from '../../utils/tradePlan'

const market = useMarketStore()
const analysis = useAnalysisStore()
const risk = useRiskStore()

const preliminaryPlan = computed(() => generateTradePlan(market.klines, analysis.indicators, analysis.analysis, risk.result))
const plan = computed(() => generateTradePlan(market.klines, analysis.indicators, analysis.analysis, risk.result))
const structure = computed(() => analyzeStructure(market.klines))

async function refresh() {
  await market.refreshMarketData()
  analysis.generateAnalysis(market.klines)
  const latest = market.klines.at(-1)
  const draft = preliminaryPlan.value
  if (latest && draft.direction !== 'wait') {
    risk.setPlanInputs(draft.direction, latest.close, draft.stopLoss, draft.takeProfit)
  } else {
    risk.setPlanInputs('wait', latest?.close ?? 0, 0, 0)
  }
}

onMounted(async () => {
  market.hydrate()
  risk.hydrate()
  await refresh()
})

watch(() => [market.symbol, market.interval], refresh)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <HeaderBar
        :symbol="market.symbol"
        :interval="market.interval"
        :price="market.price"
        :change-percent="market.ticker?.priceChangePercent ?? 0"
        :quote-volume="market.ticker?.quoteVolume ?? 0"
        :funding-rate="market.funding?.fundingRate ?? 0"
        :next-funding-time="market.funding?.nextFundingTime ?? 0"
        :loading="market.loading"
        @update:symbol="market.setSymbol"
        @update:interval="market.setInterval"
        @refresh="refresh"
      />

      <main class="relative min-h-0 flex-1 overflow-hidden p-2">
        <div v-if="market.error" class="absolute left-2 right-2 top-2 z-10 rounded border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">
          {{ market.error }}。请确认网络可以访问 Binance Public API。
        </div>

        <div class="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_720px] gap-2">
          <div class="min-h-0">
            <KlineChart :klines="market.klines" />
          </div>

          <aside class="grid min-h-0 grid-cols-2 grid-rows-[minmax(0,0.9fr)_minmax(210px,0.78fr)_240px] gap-2 overflow-hidden">
            <ScorePanel :analysis="analysis.analysis" />
            <ConsensusPanel :consensus="market.consensus" />
            <div class="col-span-2 min-h-0">
              <TradePlanPanel :plan="plan" />
            </div>
            <RiskCalculator
              :balance="risk.balance"
              :risk-percent="risk.riskPercent"
              :leverage="risk.leverage"
              :result="risk.result"
              @update:balance="risk.balance = $event"
              @update:risk-percent="risk.riskPercent = $event"
              @update:leverage="risk.leverage = $event"
              @calculate="risk.calculateRisk"
              @reset="risk.resetRisk"
            />
            <StructurePanel :structure="structure" />
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>
