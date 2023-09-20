import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import GSAP from 'gsap'
import Experience from '../General/Experience'
import Camera from '../General/Camera'

export default class Controller {
  experience!: Experience

  scene!: THREE.Scene

  camera!: Camera

  // 样条曲线
  curve!: THREE.CatmullRomCurve3

  // 虚拟点
  position!: THREE.Vector3

  lookAtPosition!: THREE.Vector3

  progress!: number

  // 方向向量
  directionalVector!: THREE.Vector3

  staticVector!: THREE.Vector3

  crossVector!: THREE.Vector3

  // lerp
  direction!: 'forward' | 'backward'

  lerp!: {
    current: number
    target: number
    ease: number
  }

  // transformController
  transformControls!: TransformControls

  constructor() {
    this.experience = new Experience()
    const { scene, camera } = this.experience
    this.scene = scene
    this.camera = camera

    this.progress = 0
    this.position = new THREE.Vector3(0, 0, 0)
    this.lookAtPosition = new THREE.Vector3(0, 0, 0)

    // 用于计算摄像机指向向量
    this.directionalVector = new THREE.Vector3(0, 0, 0)
    this.staticVector = new THREE.Vector3(0, -1, 0)
    this.crossVector = new THREE.Vector3(0, 0, 0)

    this.direction = 'forward'
    this.lerp = {
      current: 0,
      target: 0,
      ease: 0.1
    }

    this.setPath()
    this.setTransformControls(this.experience.world.room.actualRoom)
    // this.onWheel()
  }

  setPath() {
    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(0, 0, -5),
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(0, 0, 5)
      ],
      true
    )

    const points = this.curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })

    // Create the final object to add to the scene
    const curveObject = new THREE.Line(geometry, material)
    this.scene.add(curveObject)
  }

  onWheel() {
    window.addEventListener('wheel', (e: WheelEvent) => {
      const { deltaY } = e
      if (deltaY > 0) {
        this.lerp.target += 0.1
        this.direction = 'forward'
      } else {
        this.lerp.target -= 0.1
        this.direction = 'backward'
      }
    })
  }

  setTransformControls(target: THREE.Object3D) {
    this.transformControls = new TransformControls(
      this.camera.perspectiveCamera,
      this.experience.canvas
    )
    this.transformControls.size = 0.75
    this.transformControls.showX = false
    this.transformControls.space = 'world'
    this.transformControls.attach(target)

    // 当使用 transformControls 时，需要禁用其他的 Controls
    this.transformControls.addEventListener('mouseDown', () => {
      this.camera.controls.enabled = false
    })
    this.transformControls.addEventListener('mouseUp', () => {
      this.camera.controls.enabled = true
    })
    this.scene.add(this.transformControls)
  }

  // resize() {}
  update() {
    // console.log(this.camera)
    this.lerp.current = GSAP.utils.interpolate(this.lerp.current, this.lerp.target, this.lerp.ease)
    // 自动播放
    if (this.direction === 'backward') {
      this.lerp.target -= 0.001
    } else {
      this.lerp.target += 0.001
    }
    // 将范围限制在[0, 1]之间，避免边界情况造成的错误
    this.lerp.current = GSAP.utils.clamp(0, 1, this.lerp.current)
    this.lerp.target = GSAP.utils.clamp(0, 1, this.lerp.target)
    // 更新两个 point 的位置信息
    this.curve.getPointAt(this.lerp.current % 1, this.position)
    this.camera.orthographicCamera.position.copy(this.position)
    this.curve.getPointAt(this.lerp.current, this.lookAtPosition)
    this.directionalVector.subVectors(this.curve.getPointAt(this.lerp.current % 1), this.position)
    this.directionalVector.normalize()
    this.crossVector.crossVectors(this.directionalVector, this.staticVector)
    this.crossVector.multiplyScalar(100000)
    this.camera.orthographicCamera.lookAt(this.crossVector)
  }
}
