import { EventEmitter } from 'events'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import Experience from '../General/Experience'
import Renderer from '../General/Renderer'
import type { AssetsType } from '../interface'

export default class Resource extends EventEmitter {
  experience!: Experience

  renderer!: Renderer

  items!: Record<string, any>

  queue!: number

  loaded!: number

  loaders!: {
    gltfLoader: GLTFLoader
    stlLoader: STLLoader
    dracoLoader: DRACOLoader
  }

  video!: Record<string, HTMLVideoElement>

  videoTexture!: Record<string, THREE.VideoTexture>

  constructor() {
    super()
    this.experience = new Experience()
    this.renderer = this.experience.renderer

    this.items = {}
    this.loaded = 0
    this.setLoaders()
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      stlLoader: new STLLoader(),
      dracoLoader: new DRACOLoader()
    }
    this.loaders.dracoLoader.setDecoderPath('/draco/')
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
  }

  startLoad(assets: AssetsType[]) {
    this.queue = assets.length
    for (const asset of assets) {
      this.loaders.gltfLoader.load(asset.path, (file) => {
        this.singleAssetLoaded(asset, file)
      })
    }
  }

  singleAssetLoaded(asset: AssetsType, file: any) {
    this.items[asset.name] = file
    this.loaded++
    if (this.loaded === this.queue) {
      this.queue = 0
      this.emit('ready')
    }
  }
}
