import * as THREE from 'three'
import Experience from '../General/Experience'
import Resource from '../Utils/Resource'

export default class Environment {
  experience!: Experience

  scene!: THREE.Scene

  resource!: Resource

  sunLight!: THREE.DirectionalLight

  sunLightHelper!: THREE.DirectionalLightHelper

  ambientLight!: THREE.AmbientLight

  constructor() {
    this.experience = new Experience()
    const { scene, resource } = this.experience
    this.scene = scene
    this.resource = resource
    this.setAmbientLight()
  }

  // 创建日光
  setSunlight(options: {
    color: THREE.Color
    intensity: number
    showHelper: boolean
    position: { x: number; y: number; z: number }
  }) {
    if (!this.sunLight) {
      this.sunLight = new THREE.DirectionalLight('#ffffff', 1)
      this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 1)
      this.scene.add(this.sunLight, this.sunLightHelper)
    }
    const { position, showHelper, color, intensity } = options
    this.sunLightHelper.visible = showHelper
    const { x, y, z } = position
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 10
    this.sunLight.shadow.mapSize.set(2048, 2048)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.color.set(color)
    this.sunLight.intensity = intensity
    this.sunLight.position.set(x, y, z)
  }

  // 创建环境光
  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight('#ffffff', 3)
    this.scene.add(this.ambientLight)
  }
}
