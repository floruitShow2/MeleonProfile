import EventEmitter from 'events'
import Experience from './Experience'
import Sizes from '../Utils/Sizes'
import Resource from '../Utils/Resource'
import Camera from './Camera'
import World from '../World/World'

export default class Preloader extends EventEmitter {
  experience!: Experience

  scene!: THREE.Scene

  sizes!: Sizes

  resource!: Resource

  camera!: Camera

  world!: World

  room!: THREE.Group

  constructor() {
    super()
    this.experience = new Experience()
    const { scene, sizes, resource, camera, world } = this.experience
    this.scene = scene
    this.sizes = sizes
    this.resource = resource
    this.camera = camera
    this.world = world
    this.world.on('worldready', () => {
      this.setAssets()
    })
  }

  setAssets() {
    this.room = this.experience.world.room.room
    this.experience.renderer.update()
  }
}
