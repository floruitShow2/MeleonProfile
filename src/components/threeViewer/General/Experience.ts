import * as THREE from 'three'
import Camera from './Camera'
import Renderer from './Renderer'
import Resource from '../World/Resource'
import Sizes from '../Utils/Sizes'
import Time from '../Utils/Time'
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

  loadModel(assets: AssetsType[]) {
    return new Promise((resolve) => {
      this.resource.startLoad(assets)
      this.resource.on('ready', resolve)
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.renderer.update()
  }
}
