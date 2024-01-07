import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import GSAP from 'gsap'
import CameraControls from 'camera-controls'
import EventEmitter from 'events'
import { EventsMap } from './events'
import type { LoadPoints, LoadSphere, PointEntity, VrRoomOptions } from './interface'

CameraControls.install({ THREE })

export default class VrRoom extends EventEmitter {
  $options!: VrRoomOptions

  scene!: THREE.Scene

  camera!: THREE.PerspectiveCamera

  renderer!: THREE.WebGLRenderer

  clock!: THREE.Clock

  light!: THREE.AmbientLight

  controls!: CameraControls

  size!: { width: number; height: number }

  constructor(options: VrRoomOptions) {
    super()
    this.$options = Object.assign(options)
    this.initSize()
    this.init()

    if (this.$options.debugger) {
      this.initControls()
    }

    this.initEvents()
    this.animate()
  }

  // 渲染场景及相关配置
  private init() {
    const { container, cameraPosition, cameraLookAt } = this.$options

    // 场景
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x101010)

    // 灯光
    const light = new THREE.AmbientLight(0xffffff, 2)
    this.scene.add(light)

    // 摄像机
    const { width, height } = this.size
    this.camera = new THREE.PerspectiveCamera(90, width / height, 0.01, 2000)
    this.camera.position.copy(cameraPosition)
    this.scene.add(this.camera)

    // 渲染器
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.size.width, this.size.height)
    this.renderer.xr.enabled = true
    this.renderer.xr.setReferenceSpaceType('local')

    // 时钟
    this.clock = new THREE.Clock()

    if (container) {
      container.appendChild(this.renderer.domElement)
      // 添加轨道控制器
      //   this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      //   this.controls.target.set(0, 0, 0)
      //   this.controls.enableDamping = true // 惯性效果
      //   this.controls.minPolarAngle = Math.PI / 2 // 禁止上拖动
      //   this.controls.maxPolarAngle = Math.PI / 2 // 禁止下拖动
      //   this.controls.enableZoom = false
      //   this.controls.enablePan = false
      //   this.controls.minDistance = 0.01
      //   this.controls.maxDistance = 70

      //  控制器
      this.controls = new CameraControls(this.camera, this.$options.container)
      this.controls.maxDistance = 0.000001
      // 禁止拖动
      this.controls.dragToOffset = false
      // 默认距离
      this.controls.distance = 1
      this.controls.azimuthRotateSpeed = -0.5
      this.controls.polarRotateSpeed = -0.5
      this.controls.saveState()

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
    }

    window.addEventListener('resize', this.onWindowResize)
  }

  // 实时更新渲染场景
  private render() {
    // If we are not presenting move the camera a little so the effect is visible
    this.renderer.render(this.scene, this.camera)

    if (this.controls) this.controls.update(this.clock.getDelta())
  }

  private animate() {
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  // 监听屏幕尺寸变化
  private initSize() {
    if (!this.size) {
      this.size = { width: 0, height: 0 }
    }
    const { width, height } = this.$options.container.getBoundingClientRect()
    this.size.width = width
    this.size.height = height
  }

  private onWindowResize() {
    this.initSize()
    this.renderer.setSize(this.size.width, this.size.height)
  }

  // 通用函数
  lookAtPoint(point: THREE.Vector3) {
    const { x, y, z } = point
    this.controls.lookInDirectionOf(x, y, z, true)
  }

  // 辅助工具
  transformControls!: TransformControls

  private initControls() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControls.setSpace('local')
    // this.transformControls.setMode('rotate')
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

  // 事件
  startPoint!: THREE.Vector2

  private handleJumperEvent(data: PointEntity) {
    if (!data) return
    if (!data.targetUrl) return
    // 清除场景数据内所有的精灵标签
    this.scene.children = this.scene.children.filter((item) => String(item.type) !== 'Sprite')
    // 储存数组置空
    this.poiObjects = []
    // 重新加载贴图，这边应用gasp做一个简单的过渡动画，将透明度从0 ~ 1
    const { targetUrl } = data
    if (!targetUrl) return
    const texture = new THREE.TextureLoader().load(targetUrl)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat
    const sphereMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0
    })
    this.sphere.material = sphereMaterial
    GSAP.to(sphereMaterial, { transparent: true, opacity: 1, duration: 2 })
    // 手动更新投影矩阵
    this.camera.updateProjectionMatrix()

    this.emit(EventsMap.oJC, data)
    this.emit(EventsMap.oPC, data)
  }

  private handleDetailEvent(data: PointEntity) {
    if (!data) return
    this.lookAtPoint(data.position)
    this.emit(EventsMap.oDC, data)
    this.emit(EventsMap.oPC, data)
  }

  private handleMoveEvent(data: PointEntity) {
    if (!data) return
    const p = data.position
    this.controls.moveTo(p.x, 0, p.z, true)
    this.emit(EventsMap.oMC, data)
    this.emit(EventsMap.oPC, data)
  }

  private initEvents() {
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

      const intersects = raycaster.intersectObjects(this.poiObjects ?? [])
      const target = intersects[0]
      if (target?.object) {
        if (this.$options.debugger) {
          this.transformControls.attach(target.object)
        } else {
          const d = target.object?.userData as PointEntity
          switch (d.type) {
            case 'jumper':
              this.handleJumperEvent(d)
              break
            case 'detail':
              this.handleDetailEvent(d)
              break
            case 'move':
              this.handleMoveEvent(d)
              break
            default:
              break
          }
        }
      }
    })
  }

  sphere!: THREE.Mesh

  loadSphere(options: LoadSphere) {
    const { url } = options

    const sphereGeometry = new THREE.SphereGeometry(1, 250, 250)
    const texture = new THREE.TextureLoader().load(url)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture })
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    this.sphere.geometry.scale(1, 1, -1)

    // On load complete add the panoramic sphere to the scene
    this.scene.add(this.sphere)
  }

  poiObjects!: THREE.Sprite[]

  loadPoints(options: LoadPoints) {
    const { points } = options

    const defaultPointsMap: Record<PointEntity['type'], string> = {
      move: '/textures/circle.png',
      detail: '/textures/traffic.png',
      jumper: '/textures/edu.png'
    }

    for (let i = 0; i < points.length; i++) {
      const curPoint = points[i]
      const pointTexture = new THREE.TextureLoader().load(
        curPoint.url ? curPoint.url : defaultPointsMap[curPoint.type]
      )
      const material = new THREE.SpriteMaterial({
        map: pointTexture,
        sizeAttenuation: false
      })
      const sprite = new THREE.Sprite(material)
      sprite.userData = curPoint
      sprite.scale.set(0.1, 0.1, 0.1)
      sprite.position.copy(curPoint.position)

      if (!this.poiObjects) this.poiObjects = []
      this.poiObjects.push(sprite)

      this.scene.add(sprite)
    }
  }
}
