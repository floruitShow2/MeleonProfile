import { EventEmitter } from 'events'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import Experience from '../General/Experience'
import Renderer from '../General/Renderer'

interface AssetsType {
  name: string
  type: string
  path: string
}
export default class Resource extends EventEmitter {
  experience!: Experience

  renderer!: Renderer

  assets!: AssetsType[]

  items!: any

  queue!: number

  loaded!: number

  loaders!: {
    gltfLoader: GLTFLoader
    stlLoader: STLLoader
    dracoLoader: DRACOLoader
  }

  video!: Record<string, HTMLVideoElement>

  videoTexture!: Record<string, THREE.VideoTexture>

  constructor(assets: AssetsType[]) {
    super()
    this.experience = new Experience()
    this.renderer = this.experience.renderer
    this.assets = assets

    this.items = {}
    this.queue = this.assets.length
    this.loaded = 0
    this.setLoaders()
    this.startLoading()
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

  startLoading() {
    for (const asset of this.assets) {
      // http://192.168.22.61:8008/api/MainInterface/Download3D
      if (asset.type === 'glbModel') {
        this.loaders.gltfLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset, file)
        })
      } else if (asset.type === 'videoTexture') {
        this.video = {}
        this.videoTexture = {}
        // 新增 video 元素
        this.video[asset.name] = document.createElement('video')
        this.video[asset.name].src = asset.path
        this.video[asset.name].muted = true
        this.video[asset.name].playsInline = true
        this.video[asset.name].autoplay = true
        this.video[asset.name].loop = true
        this.video[asset.name].play()
        // 新增 videoTexture
        this.videoTexture[asset.name] = new THREE.VideoTexture(this.video[asset.name])
        this.videoTexture[asset.name].minFilter = THREE.NearestFilter
        this.videoTexture[asset.name].magFilter = THREE.NearestFilter
        this.videoTexture[asset.name].generateMipmaps = false
        this.videoTexture[asset.name].encoding = THREE.sRGBEncoding
        this.singleAssetLoaded(asset, this.videoTexture[asset.name])
      }
    }
  }

  singleAssetLoaded(asset: AssetsType, file: any) {
    this.items[asset.name] = file
    this.loaded++
    if (this.loaded === this.queue) {
      this.emit('ready')
    }
  }
}
