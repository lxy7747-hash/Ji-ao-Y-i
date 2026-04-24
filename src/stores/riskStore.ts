import { defineStore } from 'pinia'
import type { Direction } from '../types/analysis'
import type { RiskResult } from '../types/risk'
import { calculateRisk } from '../utils/risk'

const STORAGE_KEY = 'crypto-analyzer-risk'

interface SavedRiskSettings {
  balance?: number
  riskPercent?: number
  leverage?: number
}

const defaultResult = (): RiskResult => ({
  maxLoss: 0,
  positionValue: 0,
  marginRequired: 0,
  riskRewardRatio: 0,
  estimatedLiquidationPrice: 0,
  riskStatus: '参数不足',
})

export const useRiskStore = defineStore('risk', {
  state: () => ({
    balance: 1000,
    riskPercent: 1,
    leverage: 5,
    direction: 'wait' as Direction,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    result: defaultResult(),
  }),
  actions: {
    hydrate() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as SavedRiskSettings
      if (typeof saved.balance === 'number') this.balance = saved.balance
      if (typeof saved.riskPercent === 'number') this.riskPercent = saved.riskPercent
      if (typeof saved.leverage === 'number') this.leverage = saved.leverage
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        balance: this.balance,
        riskPercent: this.riskPercent,
        leverage: this.leverage,
      }))
    },
    setPlanInputs(direction: Direction, entryPrice: number, stopLoss: number, takeProfit: number) {
      this.direction = direction
      this.entryPrice = entryPrice
      this.stopLoss = stopLoss
      this.takeProfit = takeProfit
      this.calculateRisk()
    },
    calculateRisk() {
      this.result = calculateRisk({
        balance: this.balance,
        riskPercent: this.riskPercent,
        leverage: this.leverage,
        direction: this.direction,
        entryPrice: this.entryPrice,
        stopLoss: this.stopLoss,
        takeProfit: this.takeProfit,
      })
      this.persist()
    },
    resetRisk() {
      this.balance = 1000
      this.riskPercent = 1
      this.leverage = 5
      this.result = defaultResult()
      this.persist()
    },
  },
})
