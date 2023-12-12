import { EventEmitter } from 'events'

export default class Time extends EventEmitter {
  start!: number

  current!: number

  elapsed!: number

  delta!: number

  constructor() {
    super()
    // 实例创建的时间
    this.start = Date.now()
    // 当前时间
    this.current = this.start
    // 经过的时间
    this.elapsed = 0
    // 每一帧间隔的时间
    // 由于正常浏览器的帧率为每秒60帧，即 1 * 1000 / 60 = 16.66666...，此处设置默认间隔为16
    this.delta = 16
    this.update()
  }

  update() {
    const nextFrameTime = Date.now()
    this.delta = nextFrameTime - this.current
    this.current = nextFrameTime
    this.elapsed = this.current - this.start
    this.emit('update')
    window.requestAnimationFrame(() => this.update())
  }
}
