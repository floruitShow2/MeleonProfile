import LargeFileWorker from './worker?worker'

export default class LargeFileInstance {
  // eslint-disable-next-line
  static instance: LargeFileInstance

  worker!: Worker

  constructor() {
    if (LargeFileInstance.instance) return LargeFileInstance.instance
    this.worker = new LargeFileWorker()
    LargeFileInstance.instance = this
  }

  getWorker() {
    return this.worker
  }
}
