import * as THREE from 'three'
import type { RestrictType } from '@/components/search'
import Experience from '../General/Experience'
import Camera from '../General/Camera'
import Time from '../Utils/Time'
import Sizes from '../Utils/Sizes'
import Resource from './Resource'

export default class model {
  experience!: Experience

  sizes!: Sizes

  time!: Time

  scene!: THREE.Scene

  camera!: Camera

  canvas!: HTMLCanvasElement

  renderer!: THREE.WebGLRenderer

  resource!: Resource

  model!: any

  actualModel!: THREE.Group

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
    // 选择默认渲染的模型
    const defaultModel = Object.keys(this.resource.items)[0]
    this.model = this.resource.items[defaultModel]
    this.actualModel = this.model.scene
    this.setModel()
    // this.setAnimations()
  }

  generateLayers<T extends RestrictType>(
    group: THREE.Object3D,
    result: Array<T>,
    pid?: number | string | symbol
  ) {
    // 基于模型生成图层列表
    group.children.forEach((child) => {
      child.castShadow = true
      child.receiveShadow = true
      if (child.children && child.children.length) {
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
    })
  }

  setModel() {
    // 重设图层对象
    this.layers = []
    this.generateLayers(this.actualModel, this.layers)
    const width = 0.5
    const height = 0.7
    const intensity = 1
    const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height)
    rectLight.position.set(7.68244, 7, 0.5)
    rectLight.rotation.x = -Math.PI / 2
    rectLight.rotation.z = Math.PI / 4
    this.actualModel.add(rectLight)
    this.scene.add(this.actualModel)
  }

  setAnimations() {
    this.mixer = new THREE.AnimationMixer(this.actualModel)
    this.swim = this.mixer.clipAction(this.model.animations[0])
    this.swim.play()
  }

  resize() {
    console.log(this.model)
  }

  update() {
    if (this.mixer) this.mixer.update(this.time.delta * 0.0009)
  }
}
