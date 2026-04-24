import { defineStore } from 'pinia'
import type { AnalysisRecord, ReviewLog } from '../types/analysis'

const RECORD_KEY = 'crypto-analyzer-records'
const REVIEW_KEY = 'crypto-analyzer-reviews'

export const useJournalStore = defineStore('journal', {
  state: () => ({
    records: [] as AnalysisRecord[],
    reviews: [] as ReviewLog[],
  }),
  actions: {
    hydrate() {
      const records = localStorage.getItem(RECORD_KEY)
      const reviews = localStorage.getItem(REVIEW_KEY)
      if (records) this.records = JSON.parse(records) as AnalysisRecord[]
      if (reviews) this.reviews = JSON.parse(reviews) as ReviewLog[]
    },
    persist() {
      localStorage.setItem(RECORD_KEY, JSON.stringify(this.records.slice(0, 30)))
      localStorage.setItem(REVIEW_KEY, JSON.stringify(this.reviews.slice(0, 30)))
    },
    saveRecord(record: AnalysisRecord) {
      this.records = [record, ...this.records.filter((item) => item.id !== record.id)].slice(0, 30)
      this.persist()
    },
    addReview(symbol: string, title: string, content: string) {
      if (!title.trim() || !content.trim()) return
      this.reviews = [{
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        symbol,
        title: title.trim(),
        content: content.trim(),
      }, ...this.reviews].slice(0, 30)
      this.persist()
    },
    removeRecord(id: string) {
      this.records = this.records.filter((item) => item.id !== id)
      this.persist()
    },
  },
})
