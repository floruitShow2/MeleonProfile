import { defineStore } from 'pinia'
import { FileState } from './types'

const useFileStore = defineStore('file', {
  state: (): FileState => ({
    workers: []
  }),
  getters: {
    getWorkers(state: FileState): Worker[] {
      return state.workers || []
    }
  },
  actions: {
    findWorker(worker: Worker) {
      const findWorker = this.workers.find((item) => item.constructor === worker.constructor)
      return findWorker || null
    },
    addWorker(worker: Worker) {
      this.workers.push(worker)
    }
  }
})

export default useFileStore
