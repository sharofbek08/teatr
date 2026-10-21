import { defineStore } from 'pinia'
import { content } from '../data/content'

export const usePerformancesStore = defineStore('performances', () => ({
  performances: content.performances,
}))
