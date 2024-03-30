import * as THREE from 'three'
import Sizes from '@/utils/three/sizes'
import Instance from '../instance'
import type { CameraOptions } from '../interface'

export default class Camera {
  instance!: Instance

  sizes!: Sizes

  scene!: THREE.Scene

  canvas!: HTMLCanvasElement

  perspectiveCamera!: THREE.PerspectiveCamera

  constructor(options?: CameraOptions) {
    this.instance = new Instance()

    const { canvas, scene, sizes } = this.instance
    this.canvas = canvas
    this.scene = scene
    this.sizes = sizes

    this.createPerspectiveCamera(options)
  }

  createPerspectiveCamera(options?: CameraOptions) {
    const cameraAt = new THREE.Vector3(0, 0, 0)
    if (options && options.cameraAt) cameraAt.copy(options.cameraAt)
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, this.sizes.aspect, 1, 2000)
    this.perspectiveCamera.position.set(cameraAt.x, cameraAt.y, cameraAt.z)
    this.perspectiveCamera.aspect = this.sizes.aspect
    this.scene.add(this.perspectiveCamera)
  }

  resize() {
    const { aspect } = this.sizes
    this.perspectiveCamera.aspect = aspect
    this.perspectiveCamera.updateProjectionMatrix()
  }
}
