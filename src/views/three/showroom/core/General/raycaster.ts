import * as THREE from 'three'
import Instance from '../instance'
import Camera from './camera'

export class Raycaster {
  instance!: Instance

  canvas!: HTMLCanvasElement

  scene!: THREE.Scene

  camera!: Camera

  raycaster!: THREE.Raycaster

  startPoint!: THREE.Vector2

  constructor() {
    this.instance = new Instance()
    const { canvas, camera, scene } = this.instance
    this.canvas = canvas
    this.scene = scene
    this.camera = camera

    this.initRaycaster()
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster()
    this.canvas.addEventListener('mousedown', (event) => {
      if (!this.startPoint) this.startPoint = new THREE.Vector2()

      this.startPoint.x = event.clientX
      this.startPoint.y = event.clientY
    })

    this.canvas.addEventListener('mouseup', (event) => {
      // 鼠标拖动时避免触发镜头移动
      const startX = this.startPoint.x
      const startY = this.startPoint.y
      if (Math.abs(startX - event.clientX) > 3 || Math.abs(startY - event.clientY) > 3) return

      const { offsetLeft, offsetTop, clientWidth, clientHeight } = this.canvas
      const curPointer = new THREE.Vector2()
      // dom.offsetLeft -- dom元素距离浏览器左侧的距离   dom.clientWidth -- dom元素宽度
      curPointer.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1
      // dom.offsetTop -- dom元素距离浏览器顶部的距离    dom.clientHeight -- dom元素高度
      curPointer.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1

      this.raycaster.setFromCamera(curPointer, this.camera.perspectiveCamera)

      const intersects = this.raycaster.intersectObjects(this.scene.children)

      const target = intersects[0]
      if (target && target.object) {
        console.log('target', target.object.name, target)
      }
    })
  }
}
