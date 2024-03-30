import * as THREE from 'three'
import Sizes from '@/utils/three/sizes'
import Instance from '../instance'
import Camera from './camera'

export default class Renderer {
  Instance!: Instance

  sizes!: Sizes

  scene!: THREE.Scene

  camera!: Camera

  canvas!: HTMLCanvasElement

  renderer!: THREE.WebGLRenderer

  showThreeViews = false

  constructor() {
    this.Instance = new Instance()
    const { scene, sizes, canvas, camera } = this.Instance
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
    console.log(width, height)
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
  }

  resize() {
    const { width, height, pixelRatio } = this.sizes
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
  }

  update() {
    this.renderer.render(this.scene, this.camera.perspectiveCamera)
  }
}
