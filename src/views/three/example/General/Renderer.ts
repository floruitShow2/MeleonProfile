import * as THREE from 'three'
import Experience from './Experience'
import Sizes from '../Utils/Sizes'
import Camera from './Camera'

export default class Renderer {
  experience!: Experience

  sizes!: Sizes

  scene!: THREE.Scene

  camera!: Camera

  canvas!: HTMLCanvasElement

  renderer!: THREE.WebGLRenderer

  showThreeViews = false

  constructor() {
    this.experience = new Experience()
    const { scene, sizes, canvas, camera } = this.experience
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.setRenderer()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })
    // this.renderer.useLegacyLights = true
    // this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.toneMapping = THREE.CineonToneMapping
    this.renderer.toneMappingExposure = 0.5
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    const { width, height, pixelRatio } = this.sizes
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
  }

  // 切换视图模式
  switchViewsModel(options: { showThreeViews: boolean }) {
    const { showThreeViews } = options
    this.showThreeViews = showThreeViews
  }

  resize() {
    const { width, height, pixelRatio } = this.sizes
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
  }

  update() {
    const { width, height } = this.sizes
    if (this.showThreeViews) {
      // main screen
      this.renderer.setViewport(0, 0, width / 2, height / 2)
      this.renderer.render(this.scene, this.camera.perspectiveCamera)
      // three sub screens
    } else {
      // main screen
      this.renderer.setViewport(0, 0, width, height)
      this.renderer.render(this.scene, this.camera.orthographicCamera)
    }
  }
}
