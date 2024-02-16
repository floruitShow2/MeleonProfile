import * as THREE from 'three'
import Experience from '../General/Experience'

export default class Room {
  experience!: Experience

  scene!: THREE.Scene

  geometry!: THREE.PlaneGeometry

  material!: THREE.MeshStandardMaterial

  plane!: THREE.Mesh

  constructor() {
    this.experience = new Experience()
    const { scene } = this.experience
    this.scene = scene

    this.setFloor()
  }

  setFloor() {
    this.geometry = new THREE.PlaneGeometry(100, 100)
    this.material = new THREE.MeshStandardMaterial({ color: '#B1D3FF', side: THREE.BackSide })
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.rotation.x = Math.PI / 2
    this.plane.position.y = -0.3
    this.scene.add(this.plane)
  }

  //   resize() {}

  //   update() {}
}
