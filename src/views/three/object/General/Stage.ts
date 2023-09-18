import * as THREE from 'three'
import GSAP from 'gsap'

class Stage {
  canvas!: HTMLCanvasElement

  renderer!: THREE.WebGLRenderer

  scene!: THREE.Scene

  camera!: THREE.OrthographicCamera

  light!: THREE.DirectionalLight

  ambientLight!: THREE.AmbientLight

  width!: number

  height!: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.initSize()
    this.initRenderer()
    // 初始化场景
    this.scene = new THREE.Scene()
    this.initCamera()
    this.initLight()
    this.render()
  }

  initRenderer() {
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor('#D0CBC7', 1)
  }

  initSize() {
    const { width, height } = this.canvas.getBoundingClientRect()
    this.width = width
    this.height = height
  }

  initCamera() {
    // 初始化相机
    const aspect = this.width / this.height
    const d = 20
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000)
    this.camera.position.x = 2
    this.camera.position.y = 2
    this.camera.position.z = 2
    this.camera.lookAt(0, 0, 0)
  }

  setCamera(y: number, speed = 0.3) {
    GSAP.to(this.camera.position, speed, { y: y + 4 })
    GSAP.to(this.camera.lookAt, speed, { y })
  }

  initLight() {
    this.light = new THREE.DirectionalLight(0xffffff, 0.5)
    this.light.position.set(0, 8, 0)

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(this.light, this.ambientLight)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  add(...elem: THREE.Object3D[]) {
    this.scene.add(...elem)
  }

  remove(elem: THREE.Object3D) {
    this.scene.remove(elem)
  }
}

export default Stage
