import * as THREE from 'three'
import EventEmitter from 'events'
import { Sizes } from '@/utils/three'
import Experience from '../General/Experience'
import Camera from '../General/Camera'
import Environment from './Environment'
import Resource from './Resource'
import Models from './Models'

export default class World extends EventEmitter {
  experience!: Experience

  canvas!: HTMLCanvasElement

  camera!: Camera

  scene!: THREE.Scene

  renderer!: THREE.WebGLRenderer

  sizes!: Sizes

  models!: Models

  //   material!: Material

  resource!: Resource

  environment!: Environment

  //   controller!: Controller

  //   raycaster!: Raycaster

  //   helper!: Helper

  constructor() {
    super()
    this.experience = new Experience()
    const { scene, sizes, canvas, camera, resource } = this.experience
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.resource = resource
    // this.helper = new Helper()
    this.resource.on('ready', () => {
      this.models = new Models()
      // this.material = new Material()
      // this.controller = new Controller()
      // this.raycaster = new Raycaster()
      this.environment = new Environment()
      this.setAssets()
    })
  }

  setAssets() {
    this.experience.renderer.update()
  }

  resize() {
    if (this.models) this.models.resize()
  }

  update() {
    if (this.models) {
      this.models.update()
      // this.controller.update()
    }
  }
}
