import * as THREE from 'three'
import GSAP from 'gsap'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import CameraControls from 'camera-controls'
import EventEmitter from 'events'
import { useDeepClone } from '@/utils/format'
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

    // 加载管理器
    this.initLoaders()

    // 控制器
    if (container) {
      container.appendChild(this.renderer.domElement)
      // 添加轨道控制器
      //   this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      //   this.controls.target.set(0, 0, 0)
      //   this.controls.enableDamping = true // 惯性效果
      //   this.controls.enableZoom = false
      //   this.controls.enablePan = false
      //   this.controls.minDistance = 0.01
      //   this.controls.maxDistance = 70

      //  控制器
      this.controls = new CameraControls(this.camera, this.$options.container)
      this.controls.maxDistance = 0.000001
      // 禁止拖动
      this.controls.dragToOffset = false
      // 限制相机旋转角度
      this.controls.minPolarAngle = Math.PI / 2 // 禁止上拖动
      this.controls.maxPolarAngle = Math.PI / 2 // 禁止下拖动
      // 默认距离
      this.controls.distance = 1
      this.controls.azimuthRotateSpeed = -0.5
      this.controls.polarRotateSpeed = -0.5
      this.lookAtPoint(cameraLookAt, false)
      this.controls.saveState()

      // this.controls.addEventListener('controlend', () => {
      //   this.emit(EventsMap.oVP, this.getUnVisiblePoints())
      // })
    }

    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  // 实时更新渲染场景
  private render() {
    // If we are not presenting move the camera a little so the effect is visible
    this.renderer.render(this.scene, this.camera)
    /**
     * @type remark
     * @description 当前场景所有信息点加载完成后，计算不在视野内的跳转点
     */
    if (this.poisForRaycaster && this.poisForRaycaster.length) {
      this.emit(EventsMap.oVP, this.getInVisiblePoints())
    }
    if (this.controls) this.controls.update(this.clock.getDelta())

    if (this.currentSphere.currentScene) {
      const { anchorPoint } = this.currentSphere.currentScene
      this.emit(EventsMap.oPeC, this.computeRotation(anchorPoint))
    }
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

  vertexShader!: string

  fragmentShader!: string

  // utils: Look in the direction of the point you clicked on
  lookAtPoint(point: THREE.Vector3, needTransition = true) {
    const { cameraPosition } = this.$options
    const lookAt = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z).lerp(
      point,
      1e-5
    )
    this.controls.setLookAt(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
      lookAt.x,
      lookAt.y,
      lookAt.z,
      needTransition
    )

    /**
     * @type bugFix
     * @description 页面首次加载，camera 的朝向一直是 (0, 0, -1)，计算的角度值错误，右侧标签与信息点未联动
     */
    this.controls.camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
  }

  // 辅助工具
  axesHelper!: THREE.AxesHelper

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

  loadingManger!: THREE.LoadingManager

  textureLoader!: THREE.TextureLoader

  private initLoaders() {
    this.loadingManger = new THREE.LoadingManager()
    this.textureLoader = new THREE.TextureLoader(this.loadingManger)
    this.loadingManger.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Started loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`)
      this.emit(EventsMap.oLS, { loadingState: '开始加载', status: 'normal' })
    }

    this.loadingManger.onLoad = () => {
      console.log('Loading complete!')
      this.emit(EventsMap.oLE, { status: 'success', loadingState: '加载完成' })
    }

    this.loadingManger.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`)
      this.emit(EventsMap.oLP, {
        url,
        itemsLoaded,
        itemsTotal,
        status: 'normal',
        loadingState: '加载中...',
        progress: +(itemsLoaded / itemsTotal).toFixed(2)
      })
    }

    this.loadingManger.onError = (url) => {
      console.log(`There was an error loading ${url}`)
      this.emit(EventsMap.oLE, { url, status: 'danger', loadingState: '加载失败' })
    }
  }

  // 辅助函数
  private computeRotation(target: THREE.Vector3): number {
    const direction1 = new THREE.Vector3()
    this.controls.camera.getWorldDirection(direction1)

    const { cameraPosition } = this.$options
    const direction2 = target.clone().sub(cameraPosition)

    const dirx = direction1.x - direction2.x
    const dirz = direction1.z - direction2.z

    const angle = (Math.atan2(dirx, dirz) * 180) / Math.PI

    return angle

    // return (Math.atan2(dirx, dirz) * 180) / Math.PI
  }

  private computeAngle(target: THREE.Vector3): number {
    const direction1 = new THREE.Vector3()
    this.controls.camera.getWorldDirection(direction1)

    const { cameraPosition } = this.$options
    const direction2 = target.clone().sub(cameraPosition)

    const angle = direction2.angleTo(direction1)

    return THREE.MathUtils.radToDeg(angle)
  }

  private getInVisiblePoints() {
    const { currentSceneID } = this.$options
    return (this.poiObjects[currentSceneID].sprites ?? [])
      .filter((point) => {
        // 只考虑 jumper 类型的信息点
        if ((point.userData as PointEntity).type !== 'jumper') return false
        return this.computeAngle(point.position) > 48
      })
      .map((poi) => {
        return poi.userData as PointEntity
      })
  }

  // 事件
  startPoint!: THREE.Vector2

  /**
   * @description 处理不同类型信息点的点击事件
   * @param data 跳转点实体
   */
  handleJumperEvent(data: PointEntity) {
    if (!data || !data?.targetId) return

    const { targetId } = data
    const position = new THREE.Vector3(0, 0, 0)

    /**
     * @type bugFix
     * @description 切换房间后，cameraPosition 始终为起始点，此时点击详情点会回到起始房间
     */
    this.$options.cameraPosition.copy(position)
    this.$options.currentSceneID = targetId

    this.controls.moveTo(position.x, position.y, position.z, true)

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

  private async handleMoveEvent(data: PointEntity) {
    if (!data || !data.targetId) return
    // 清除场景数据内所有的精灵标签
    this.scene.children = this.scene.children.filter((item) => String(item.type) !== 'Sprite')
    // 重新加载贴图，这边应用gasp做一个简单的过渡动画，将透明度从0 ~ 1
    const { targetId } = data
    const targetScene = this.findTargetSceneById(targetId)
    if (!targetScene) {
      console.warn('no matched scene!!!')
      return
    }
    const texture = await this.createTexture(targetScene)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0
    })
    this.sphere.material = sphereMaterial
    GSAP.to(sphereMaterial, {
      transparent: true,
      opacity: 1,
      duration: 2,
      onComplete: () => {
        this.$options.currentSceneID = targetId
        this.loadPoints(targetScene)
        ;(this.sphere.material as THREE.Material).transparent = false
        // 手动更新投影矩阵
        this.camera.updateProjectionMatrix()
        this.emit(EventsMap.oMC, data)
        this.emit(EventsMap.oPC, data)
      }
    })
  }

  // 初始化点击事件
  private initEvents() {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const { container } = this.$options

    container.addEventListener('mousedown', (event) => {
      if (!this.startPoint) this.startPoint = new THREE.Vector2()
      this.startPoint.x = event.clientX
      this.startPoint.y = event.clientY
    })
    // 点击地板时触发移动
    container.addEventListener('mouseup', (event) => {
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

      const intersects = raycaster.intersectObjects(this.poisForRaycaster)

      const target = intersects[0]
      if (target?.object) {
        if (this.$options.debugger) {
          this.transformControls.attach(target.object)
        } else {
          const dot = target.object?.userData as PointEntity
          switch (dot.type) {
            case 'detail':
              this.handleDetailEvent(dot)
              break
            case 'jumper':
            case 'move':
              this.handleMoveEvent(dot)
              break
            default:
              break
          }
        }
      }
    })
  }

  // spheres!: Record<string, LoadSphere & { sphere: THREE.Mesh }>
  sphere!: THREE.Mesh

  textures!: Record<string, LoadSphere & { texture: THREE.Texture }>

  findTargetSceneById(id: string): LoadSphere {
    const findScene = this.$options.scenes.find((scene) => scene.id === id)
    return findScene!
  }

  get currentSphere() {
    const { currentSceneID: id } = this.$options

    return {
      currentScene: this.findTargetSceneById(id),
      currentTexture: this.textures[id].texture,
      currentPoints: this.poiObjects[id]
    }
  }

  createTexture(options: LoadSphere): THREE.Texture {
    if (!this.textures) this.textures = {}

    const { id, url } = options

    if (this.textures[id]) return this.textures[id].texture

    const texture = this.textureLoader.load(url)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat

    this.textures[id] = { ...options, texture }

    return texture
  }

  loadSphere() {
    // 初始化 贴图 和 信息点
    this.$options.scenes.forEach((option) => {
      this.createTexture(option)
      // this.loadPoints(option)
    })

    const { currentScene, currentTexture } = this.currentSphere

    const sphereGeometry = new THREE.SphereGeometry(1, 250, 250)
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: currentTexture })

    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    this.sphere.position.copy(new THREE.Vector3(0, 0, 0))
    this.sphere.geometry.scale(1, 1, -1)

    // On load complete add the panoramic sphere to the scene
    this.scene.add(this.sphere)

    this.loadPoints(currentScene)
  }

  poiObjects: Record<string, LoadPoints & { sprites: THREE.Sprite[] }> = {}

  /**
   * @type remark
   * @description 计算得到当前场景中的信息点精灵图列表
   */
  get poisForRaycaster() {
    return this.poiObjects[this.$options.currentSceneID]?.sprites ?? []
  }

  loadPoints(options: LoadPoints) {
    const { id, points } = options

    console.log(id, this.poiObjects[id])
    if (this.poiObjects[id] && this.poiObjects[id].sprites && this.poiObjects[id].sprites.length) {
      this.poiObjects[id].sprites.forEach((sprite) => {
        this.scene.add(sprite)
      })

      return
    }

    const defaultPointsMap: Record<PointEntity['type'], string> = {
      move: '/textures/circle.png',
      detail: '/textures/traffic.png',
      jumper: '/textures/edu.png'
    }

    for (let i = 0; i < points.length; i++) {
      const curPoint = points[i]
      const pointTexture = this.textureLoader.load(
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

      if (!this.poiObjects) this.poiObjects = {}
      if (!this.poiObjects[id]) this.poiObjects[id] = { ...options, sprites: [] }
      this.poiObjects[id].sprites.push(sprite)

      this.scene.add(sprite)
    }

    console.log(this.scene)
  }
}
