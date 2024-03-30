import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Instance from '../instance'

export default class Controller {
  instance!: Instance

  canvas!: HTMLCanvasElement

  camera!: THREE.PerspectiveCamera

  orbitControls!: OrbitControls

  constructor() {
    this.instance = new Instance()
    const { canvas, camera } = this.instance
    this.canvas = canvas
    this.camera = camera.perspectiveCamera

    this.initOrbitControl()
  }

  initOrbitControl() {
    this.orbitControls = new OrbitControls(this.camera, this.canvas)
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.05
    this.orbitControls.enableZoom = false
    this.orbitControls.enablePan = false
    this.orbitControls.minDistance = 0
    this.orbitControls.maxDistance = 200
    const { x, y, z } = this.camera.position
    this.orbitControls.target.set(x, y - 1, z + 10)
  }

  update() {
    if (this.orbitControls) this.orbitControls.update()
  }
}
