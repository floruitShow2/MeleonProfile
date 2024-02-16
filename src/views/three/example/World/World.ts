import * as THREE from 'three'
import EventEmitter from 'events'
import Experience from '../General/Experience'
import Camera from '../General/Camera'
import Sizes from '../Utils/Sizes'
import Resource from '../Utils/Resource'
import Room from './Room'
import Floor from './Floor'
import Material from '../Utils/Material'
import Environment from './Environment'
import Controller from './Controller'
import Helper from './Helper'
import Raycaster from '../Utils/Raycaster'

export default class World extends EventEmitter {
  experience!: Experience

  canvas!: HTMLCanvasElement

  camera!: Camera

  scene!: THREE.Scene

  renderer!: THREE.WebGLRenderer

  sizes!: Sizes

  room!: Room

  floor!: Floor

  material!: Material

  resource!: Resource

  environment!: Environment

  controller!: Controller

  raycaster!: Raycaster

  helper!: Helper

  constructor() {
    super()
    this.experience = new Experience()
    const { scene, sizes, canvas, camera, resource } = this.experience
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.resource = resource
    this.helper = new Helper()
    this.resource.on('ready', () => {
      this.room = new Room()
      this.floor = new Floor()
      this.material = new Material()
      this.controller = new Controller()
      this.raycaster = new Raycaster()
      this.environment = new Environment()
      this.emit('worldready')
    })
  }

  resize() {
    if (this.room) this.room.resize()
  }

  update() {
    if (this.room) {
      this.room.update()
      // this.controller.update()
    }
  }
}
