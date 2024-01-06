import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import CameraControls from 'camera-controls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { DrawsEntity, LoadGltf, LoadHall, VHallOptions } from './interface'

CameraControls.install({ THREE })

export default class VHall {
  // 模块配置项
  $options: VHallOptions

  scene!: THREE.Scene

  camera!: THREE.PerspectiveCamera

  renderer!: THREE.WebGLRenderer

  clock!: THREE.Clock

  light!: THREE.AmbientLight

  controls!: CameraControls

  loader!: GLTFLoader

  // 地板名称
  floorName!: string

  constructor(options: VHallOptions) {
    this.$options = Object.assign(options)
    this.loader = new GLTFLoader()
    this.init()
    this.initEvent()
    if (this.$options.debugger) this.initTransfroms()
    this.animate()
  }

  private init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$options.container,
      antialias: true
    })
    const { container, cameraPosition, cameraLookAt } = this.$options
    const { clientWidth, clientHeight } = container
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(clientWidth, clientHeight)

    // 场景
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color('#2F2F2F')

    // 相机
    this.camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000)
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    this.scene.add(this.camera)

    // 时钟
    this.clock = new THREE.Clock()

    // 环境光
    this.light = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(this.light)

    // 辅助线
    // this.scene.add(new THREE.AxesHelper(1000))

    // this.controls = new OrbitControls(this.camera, this.$options.container)
    // 更换 camera-controls
    this.controls = new CameraControls(this.camera, this.$options.container)
    // 相机和人眼间的最大距离，无限接近相当于第一人称
    this.controls.maxDistance = 0.000001
    // 禁止拖动
    this.controls.dragToOffset = false
    // 默认距离
    this.controls.distance = 1
    this.controls.azimuthRotateSpeed = -0.5
    this.controls.polarRotateSpeed = -0.5
    this.controls.saveState()
    // 缩小视距

    const lookAt = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z).lerp(
      cameraLookAt,
      1e-5
    )
    this.controls.setLookAt(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
      lookAt.x,
      lookAt.y,
      lookAt.z,
      false
    )

    this.renderer.render(this.scene, this.camera)
  }

  startPoint!: THREE.Vector2

  private initEvent() {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    this.$options.container.addEventListener('mousedown', (event) => {
      if (!this.startPoint) this.startPoint = new THREE.Vector2()

      this.startPoint.x = event.clientX
      this.startPoint.y = event.clientY
    })
    // 点击地板时触发移动
    this.$options.container.addEventListener('mouseup', (event) => {
      // 鼠标拖动时避免触发镜头移动
      const startX = this.startPoint.x
      const startY = this.startPoint.y
      if (Math.abs(startX - event.clientX) > 3 || Math.abs(startY - event.clientY) > 3) return

      const { offsetLeft, offsetTop, clientWidth, clientHeight } = this.$options.container
      // dom.offsetLeft -- dom元素距离浏览器左侧的距离   dom.clientWidth -- dom元素宽度
      pointer.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1
      // dom.offsetTop -- dom元素距离浏览器顶部的距离    dom.clientHeight -- dom元素高度
      pointer.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1

      raycaster.setFromCamera(pointer, this.camera)

      const intersects = raycaster.intersectObjects([this.vHallMesh, ...this.textureMeshs])
      const target = intersects[0]
      if (target) {
        if (target.object.name === this.floorName) {
          this.controls.moveTo(
            target.point.x,
            this.$options.cameraHeight ?? 0,
            target.point.z,
            true
          )
        }

        if (target.object && this.$options.debugger) {
          this.transformControls.attach(target.object)
        }
      }
    })
  }

  transformControls!: TransformControls

  private initTransfroms() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControls.setSpace('local')
    this.scene.add(this.transformControls)

    this.transformControls.addEventListener('mouseDown', () => {
      this.controls.enabled = false
    })
    this.transformControls.addEventListener('mouseUp', () => {
      this.controls.enabled = true
    })
    this.transformControls.addEventListener('objectChange', () => {
      if (!this.transformControls.object) return
      const { position, scale, rotation } = this.transformControls.object
      console.log(
        JSON.stringify({
          position,
          scale,
          rotation: {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z
          }
        })
      )
    })
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
    const delta = this.clock.getDelta()
    this.controls.update(delta)
  }

  vHallMesh!: THREE.Group

  /**
   * @description 加载展厅模型【gltf】
   * @param params
   */
  async loadHall(params: LoadHall) {
    const { url, position, floorName, onProgress } = params
    const res = await this.loadGltf({ url, onProgress })
    this.floorName = floorName ?? ''
    this.vHallMesh = res.scene
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

  textureLoader!: THREE.TextureLoader

  textureMeshs!: THREE.Mesh[]

  loadDraws(draws: DrawsEntity[], depth?: number) {
    this.textureLoader = new THREE.TextureLoader()

    draws.forEach(async (draw) => {
      const { url, position, scale, rotation } = draw
      const texture = await this.textureLoader.loadAsync(url)
      const maxSize = 1
      let { width, height } = texture.image
      if (width > maxSize) {
        const radio = height / width
        height = maxSize * radio
        width = maxSize
      } else {
        const radio = width / height
        width = maxSize * radio
        height = maxSize
      }

      const geometry = new THREE.BoxGeometry(width, height, depth ?? 1)
      const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const textureMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture })
      const cube = new THREE.Mesh(geometry, [
        basicMaterial,
        basicMaterial,
        basicMaterial,
        basicMaterial,
        basicMaterial,
        textureMaterial
      ])

      if (position) cube.position.copy(position)
      if (scale) cube.scale.copy(scale)
      if (rotation) cube.rotateOnAxis(rotation, Math.PI)

      if (!this.textureMeshs) this.textureMeshs = []
      this.textureMeshs.push(cube)

      this.scene.add(cube)
    })
  }
}
