import * as THREE from 'three'
import type { RestrictType } from '@/components/search'
import Time from '../Utils/Time'
import Sizes from '../Utils/Sizes'
import Camera from '../General/Camera'
import Experience from '../General/Experience'
import Resource from '../Utils/Resource'

export default class Room {
  experience!: Experience

  sizes!: Sizes

  time!: Time

  scene!: THREE.Scene

  camera!: Camera

  canvas!: HTMLCanvasElement

  renderer!: THREE.WebGLRenderer

  resource!: Resource

  room!: any

  actualRoom!: THREE.Group

  layers!: RestrictType[]

  mixer!: THREE.AnimationMixer

  swim!: THREE.AnimationAction

  constructor() {
    this.experience = new Experience()
    const { scene, resource, time, sizes, camera } = this.experience
    this.time = time
    this.sizes = sizes
    this.scene = scene
    this.camera = camera
    this.resource = resource
    // 所有导入模型中 name 为 room 的模型
    this.room = this.resource.items.room
    this.actualRoom = this.room.scene
    this.setModel()
    this.setAnimations()
  }

  generateLayers<T extends RestrictType>(
    group: THREE.Group,
    result: Array<T>,
    pid?: number | string | symbol
  ) {
    // 基于模型生成图层列表
    group.children.forEach((child) => {
      child.castShadow = true
      child.receiveShadow = true
      if (child instanceof THREE.Group) {
        const groupModel = {
          id: child.uuid,
          pid,
          label: child.name,
          hasChildren: true,
          children: []
        } as unknown as T
        result.push(groupModel)
        this.generateLayers(child, result, child.uuid)
      } else {
        const objectModel = {
          id: child.uuid,
          pid,
          label: child.name,
          hasChildren: false
        } as unknown as T
        result.push(objectModel)
      }

      if (child.name === 'Aquarium') {
        // 为水缸模型添加玻璃材质
        const childMesh = child.children[0] as THREE.Mesh
        childMesh.material = new THREE.MeshPhysicalMaterial()
        const childMeshMaterial = childMesh.material as THREE.MeshPhysicalMaterial
        childMeshMaterial.roughness = 0
        childMeshMaterial.color.set(0x549dd2)
        childMeshMaterial.ior = 3
        childMeshMaterial.transmission = 1
        childMeshMaterial.opacity = 1
        childMeshMaterial.depthWrite = false
        childMeshMaterial.depthTest = false
      }
      if (child.name === 'Computer') {
        const childMesh = child.children[1] as THREE.Mesh
        childMesh.material = new THREE.MeshBasicMaterial({
          map: this.resource.items.screen
        })
      }
      if (child.name === 'Mini_Floor') {
        // child.position.x = -0.289521
        // child.position.z = 8.83572
      }
    })
  }

  setModel() {
    // 重设图层对象
    this.layers = []
    this.generateLayers(this.actualRoom, this.layers)
    const width = 0.5
    const height = 0.7
    const intensity = 1
    const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height)
    rectLight.position.set(7.68244, 7, 0.5)
    rectLight.rotation.x = -Math.PI / 2
    rectLight.rotation.z = Math.PI / 4
    this.actualRoom.add(rectLight)
    this.scene.add(this.actualRoom)
    this.actualRoom.scale.set(0.1, 0.1, 0.1)
  }

  setAnimations() {
    this.mixer = new THREE.AnimationMixer(this.actualRoom)
    this.swim = this.mixer.clipAction(this.room.animations[0])
    this.swim.play()
  }

  resize() {
    console.log(this.room)
  }

  update() {
    if (this.mixer) this.mixer.update(this.time.delta * 0.0009)
  }
}
