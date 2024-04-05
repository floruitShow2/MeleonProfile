import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GSAP from 'gsap'
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
    // 鼠标操作变换
    this.orbitControls.mouseButtons = {
      LEFT: undefined, // 左键旋转Three.MOUSE.ROTATE
      // 禁止中键
      MIDDLE: undefined,
      // 禁止右键
      RIGHT: undefined // Three.MOUSE.PAN
    }
  }

  changeControlsTarget(target: THREE.Vector3) {
    const { x, y, z } = target
    GSAP.to(this.orbitControls.target, {
      x,
      y,
      z,
      duration: 2,
      ease: 'power3.out'
    })
  }

  update() {
    if (this.orbitControls) this.orbitControls.update()
  }
}
