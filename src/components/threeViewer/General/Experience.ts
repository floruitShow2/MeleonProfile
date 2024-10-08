import * as THREE from 'three'
import { Sizes, Time } from '@/utils/three'
import Camera from './Camera'
import Renderer from './Renderer'
import Resource from '../World/Resource'
import type { AssetsType } from '../interface'
import World from '../World/World'

export default class Experience {
  // eslint-disable-next-line
  static instance: Experience

  canvas!: HTMLCanvasElement

  wrapper!: HTMLElement

  // utils
  sizes!: Sizes

  time!: Time

  // base
  camera!: Camera

  renderer!: Renderer

  scene!: THREE.Scene

  // other
  world!: World

  resource!: Resource

  constructor(canvas?: HTMLCanvasElement, wrapper?: HTMLElement) {
    if (Experience.instance || !canvas || !wrapper) {
      return Experience.instance
    }
    Experience.instance = this
    // DOM
    this.canvas = canvas
    this.wrapper = wrapper

    // Utils
    this.sizes = new Sizes(this.canvas, this.wrapper)
    this.time = new Time()

    // General
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#2F2F2F')
    this.camera = new Camera()
    this.renderer = new Renderer()

    // World
    this.resource = new Resource()
    this.world = new World()

    this.sizes.on('resize', () => {
      this.resize()
    })
    this.time.on('update', () => {
      this.update()
    })
  }

  updateDom(canvas: HTMLCanvasElement, wrapper: HTMLElement) {
    this.canvas = canvas
    this.wrapper = wrapper
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.renderer.update()
  }

  /**
   * @description 提供 模型名称、模型url 等信息导入模型文件
   * @param assets
   * @returns
   */
  loadModel(assets: AssetsType[]) {
    return new Promise((resolve) => {
      this.resource.startLoad(assets)
      this.resource.on('ready', resolve)
    })
  }

  /**
   * @description 获取当前预览的模型实例
   * @returns
   */
  getActualModel() {
    return this.world.models.actualModel
  }

  /**
   * @description 获取模型的图层信息
   * @returns
   */
  getModelLayers() {
    return this.world.models.layers ?? []
  }
}
