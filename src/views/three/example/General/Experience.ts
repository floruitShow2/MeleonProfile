import * as THREE from 'three'
import { Sizes, Time } from '@/utils/three'
import Camera from './Camera'
import Renderer from './Renderer'
import World from '../World/World'
import assets from '../Utils/Assets'
import Resource from '../Utils/Resource'
import Preloader from './Preloader'

export default class Experience {
  // eslint-disable-next-line
  static instance: Experience

  canvas!: HTMLCanvasElement

  wrapper!: HTMLElement

  // utils
  sizes!: Sizes

  time!: Time

  resource!: Resource

  // base
  camera!: Camera

  renderer!: Renderer

  scene!: THREE.Scene

  // other
  world!: World

  preloader!: Preloader

  constructor(canvas?: HTMLCanvasElement, wrapper?: HTMLElement) {
    if (Experience.instance || !canvas || !wrapper) {
      return Experience.instance
    }
    Experience.instance = this
    this.canvas = canvas
    this.wrapper = wrapper
    this.sizes = new Sizes(this.canvas, this.wrapper)
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#2F2F2F')
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.resource = new Resource(assets)
    this.world = new World()
    this.preloader = new Preloader()
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
    this.world.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }
}
