import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Experience from './Experience'
import Sizes from '../Utils/Sizes'

export default class Camera {
  experience!: Experience

  sizes!: Sizes

  scene!: THREE.Scene

  canvas!: HTMLCanvasElement

  // 三视图功能
  frontViewCamera!: THREE.PerspectiveCamera

  leftViewCamera!: THREE.PerspectiveCamera

  TopViewCamera!: THREE.PerspectiveCamera

  // 透视相机
  perspectiveCamera!: THREE.PerspectiveCamera

  frustrum = 20

  orthographicCamera!: THREE.OrthographicCamera

  // controls
  controls!: OrbitControls

  // frontViewCameraControl!: OrbitControls

  // leftViewCameraControl!: OrbitControls

  // TopViewCameraControl!: OrbitControls

  cameraHelper!: THREE.CameraHelper

  constructor() {
    this.experience = new Experience()
    const { scene, sizes, canvas } = this.experience
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    // create threejs camera: 分别创建 透视相机 和 正交相机
    this.perspectiveCamera = this.createPerspectiveCamera(60, 60, 100)
    this.frontViewCamera = this.createPerspectiveCamera(0, 0, 10)
    this.leftViewCamera = this.createPerspectiveCamera(15, 0, 0)
    this.TopViewCamera = this.createPerspectiveCamera(0, 15, 0)
    // this.setViewOrbitControls(this.frontViewCamera, this.frontViewCameraControl)
    // this.setViewOrbitControls(this.leftViewCamera, this.leftViewCameraControl)
    // this.setViewOrbitControls(this.TopViewCamera, this.TopViewCameraControl)

    this.createOrthographicCamera()
    this.setOrbitControls(this.perspectiveCamera)
  }

  createPerspectiveCamera(x: number, y: number, z: number) {
    const camera = new THREE.PerspectiveCamera(35, this.sizes.aspect, 0.1, 1000)
    this.scene.add(camera)
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    return camera
    // this.perspectiveCamera = new THREE.PerspectiveCamera(35, this.sizes.aspect, 0.1, 1000)
    // this.scene.add(this.perspectiveCamera)
    // this.perspectiveCamera.position.x = 26
    // this.perspectiveCamera.position.y = 14
    // this.perspectiveCamera.position.z = 29
  }

  createOrthographicCamera() {
    const { aspect } = this.sizes
    const { frustrum } = this
    this.orthographicCamera = new THREE.OrthographicCamera(
      (-frustrum * aspect) / 2,
      (frustrum * aspect) / 2,
      frustrum / 2,
      -frustrum / 2,
      -10,
      10
    )

    this.scene.add(this.orthographicCamera)
    // 创建相机助手
    this.cameraHelper = new THREE.CameraHelper(this.orthographicCamera)
    this.scene.add(this.cameraHelper)
  }

  // 对 perspectiveCamera 添加轨道控制器
  setOrbitControls(camera: THREE.Camera) {
    this.controls = new OrbitControls(camera, this.canvas)
    this.controls.enableDamping = true
    this.controls.enablePan = true
    this.controls.enableRotate = true
    this.controls.enableZoom = true
  }

  // setViewOrbitControls(camera: THREE.Camera, controls: OrbitControls) {
  //   controls = new OrbitControls(camera, this.canvas)
  //   controls.enableDamping = false
  //   controls.enablePan = false
  //   controls.enableRotate = false
  //   controls.enableZoom = true
  // }

  resize() {
    const { aspect } = this.sizes
    const { frustrum } = this
    this.perspectiveCamera.aspect = aspect
    this.perspectiveCamera.updateProjectionMatrix()
    this.orthographicCamera.left = (-frustrum * aspect) / 2
    this.orthographicCamera.right = (frustrum * aspect) / 2
    this.orthographicCamera.top = frustrum / 2
    this.orthographicCamera.bottom = -frustrum / 2
    this.orthographicCamera.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
    // this.cameraHelper.matrixWorldNeedsUpdate = true
    // this.cameraHelper.update()
    // this.cameraHelper.position.copy(this.orthographicCamera.position)
    // this.cameraHelper.rotation.copy(this.orthographicCamera.rotation)
  }
}
