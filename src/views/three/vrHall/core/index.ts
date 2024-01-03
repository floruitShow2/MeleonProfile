import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { LoadGltf, LoadHall, VHallOptions } from './interface'

export default class VHall {
  // 模块配置项
  $options: VHallOptions

  scene!: THREE.Scene

  camera!: THREE.PerspectiveCamera

  renderer!: THREE.WebGLRenderer

  light!: THREE.AmbientLight

  controls!: OrbitControls

  loader!: GLTFLoader

  // 地板名称
  floorName!: string

  constructor(options: VHallOptions) {
    this.$options = Object.assign(options)
    this.loader = new GLTFLoader()
    this.init()
    this.initEvent()
    this.animate()
  }

  private init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$options.container,
      antialias: true
    })
    const { container } = this.$options
    const { clientWidth, clientHeight } = container
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(clientWidth, clientHeight)

    // 场景
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color('#2F2F2F')

    // 相机
    this.camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000)
    this.camera.position.set(1, this.$options.cameraHeight ?? 1, 1)
    this.camera.lookAt(0, 0, 0)
    this.scene.add(this.camera)

    // 环境光
    this.light = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(this.light)

    // 辅助线
    // this.scene.add(new THREE.AxesHelper(1000))

    this.controls = new OrbitControls(this.camera, this.$options.container)
    // 更换 camera-controls
    // this.controls = new CameraControls(this.scene, this.camera)
    // 相机和人眼间的最大距离，无限接近相当于第一人称
    // this.controls.maxDistance = 0.000001
    // 禁止拖动
    // this.controls.dragToOffset = false
    // 默认距离
    // this.controls.distance = 1
    // this.controls.azimuthRotateSpeed = -0.5
    // this.controls.polarRotateSpeed = -0.5
    // this.controls.saveState()

    this.renderer.render(this.scene, this.camera)
  }

  private initEvent() {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    this.$options.container.addEventListener('click', (e) => {
      const { offsetLeft, offsetTop, clientWidth, clientHeight } = this.$options.container
      // dom.offsetLeft -- dom元素距离浏览器左侧的距离   dom.clientWidth -- dom元素宽度
      pointer.x = ((e.clientX - offsetLeft) / clientWidth) * 2 - 1
      // dom.offsetTop -- dom元素距离浏览器顶部的距离    dom.clientHeight -- dom元素高度
      pointer.y = -((e.clientY - offsetTop) / clientHeight) * 2 + 1

      raycaster.setFromCamera(pointer, this.camera)

      const intersects = raycaster.intersectObjects(this.scene.children)
      const target = intersects[0]

      if (target && target.object.name === this.floorName) {
        console.log('点击了地板', target)
      } else {
        console.log(target)
      }
    })
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls.update()
  }

  /**
   * @description 加载展厅模型【gltf】
   * @param params
   */
  async loadHall(params: LoadHall) {
    const { url, position, floorName, onProgress } = params
    const res = await this.loadGltf({ url, onProgress })
    this.floorName = floorName ?? ''
    if (position) {
      res.scene.position.set(position.x, position.y, position.z)
    }
    this.scene.add(res.scene)
  }

  private loadGltf(params: LoadGltf): Promise<GLTF> {
    return new Promise((resolve) => {
      const { url, onProgress } = params
      this.loader.load(
        url,
        (file) => {
          resolve(file)
        },
        (progress) => {
          if (onProgress) {
            onProgress(progress)
          }
        }
      )
    })
  }
}
