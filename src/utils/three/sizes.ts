import { EventEmitter } from 'events'

export default class Sizes extends EventEmitter {
  wrapper!: HTMLElement

  canvas!: HTMLCanvasElement

  width!: number

  height!: number

  aspect!: number

  pixelRatio!: number

  constructor(canvas: HTMLCanvasElement, wrapper: HTMLElement) {
    super()
    this.wrapper = wrapper
    this.canvas = canvas
    this.resize()
    window.addEventListener('resize', () => {
      this.resize()
      this.emit('resize')
    })
  }

  resize() {
    const { width, height } = this.wrapper.getBoundingClientRect()
    this.width = width
    this.height = height
    this.aspect = this.width / this.height
    this.canvas.width = width
    this.canvas.height = height
    // 设置设备像素比始终不超过2
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)
  }
}
