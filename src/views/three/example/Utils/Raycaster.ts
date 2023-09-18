import * as THREE from 'three'
import Experience from '../General/Experience'
import Camera from '../General/Camera'

export default class Raycaster {
  experience!: Experience

  scene!: THREE.Scene

  canvas!: HTMLCanvasElement

  camera!: Camera

  raycaster!: THREE.Raycaster

  pointer!: THREE.Vector2

  objects!: THREE.Object3D[]

  constructor() {
    this.experience = new Experience()
    const { canvas, camera, scene } = this.experience
    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.init()
  }

  init() {
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.objects = this.scene.children.filter((item) => item.type === 'Mesh')
    this.canvas.addEventListener('pointerdown', (e) => {
      this.onPointMove(e)
    })
  }

  onPointMove(event: PointerEvent) {
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )

    const maskName = 'maskObject'
    const vector3 = new THREE.Vector3()
    const maskMaterial = new THREE.MeshBasicMaterial({
      color: 0xffba00,
      transparent: true, // 设置为true，opacity才会生效
      side: THREE.DoubleSide,
      opacity: 0.6,
      depthWrite: false
    })

    // 去除 maskObject
    const object = this.scene.getObjectByName('maskObject')
    if (!object) return
    this.scene.remove(object)

    this.raycaster.setFromCamera(this.pointer, this.camera.perspectiveCamera)
    const intersects = this.raycaster.intersectObjects(this.objects)

    if (intersects.length > 0) {
      const objectMesh = intersects[0].object as unknown as THREE.Mesh
      const worldVector3 = objectMesh.getWorldPosition(vector3)
      const maskObject = objectMesh.clone()
      maskObject.name = maskName
      maskObject.scale.set(0.01, 0.01, 0.01)
      maskObject.position.copy(worldVector3)
      maskObject.material = maskMaterial
      this.experience.scene.add(maskObject)
    }

    // const intersects = this.raycaster.intersectObjects(this.objects, false)
  }
}
