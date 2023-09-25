import * as THREE from 'three'
import Experience from '../General/Experience'

const DEFAULT_GRID = {
  isShow: true,
  size: 20,
  divisions: 20,
  colorCenterLine: 0xffffff,
  colorGrid: 0xffffff
}
export default class Helper {
  experience!: Experience

  scene!: THREE.Scene

  // grid helper
  gridHelper!: THREE.GridHelper

  constructor() {
    this.experience = new Experience()
    const { scene } = this.experience
    this.scene = scene
    this.createGridHelper(DEFAULT_GRID)
  }

  createGridHelper(options: {
    isShow: boolean
    size: number
    divisions: number
    colorCenterLine: THREE.ColorRepresentation
    colorGrid: THREE.ColorRepresentation
  }) {
    if (this.gridHelper) this.scene.remove(this.gridHelper)
    const { isShow, size, divisions, colorCenterLine, colorGrid } = options
    this.gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid)
    this.gridHelper.visible = isShow
    this.scene.add(this.gridHelper)
  }
}
