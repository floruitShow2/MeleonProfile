import * as THREE from 'three'
import Experience from '../General/Experience'
import Room from '../World/Room'

export default class Material {
  experience!: Experience

  scene!: THREE.Scene

  room!: Room

  constructor() {
    this.experience = new Experience()
    const { scene, world } = this.experience
    this.room = world.room
    this.scene = scene
  }

  setMaterial(options: THREE.MeshPhongMaterialParameters) {
    const material = new THREE.MeshPhongMaterial(options)
    material.transparent = true
    // this.scene.add(new THREE.Mesh(this.room.room, material))
    this.room.room.material = material
  }
}
