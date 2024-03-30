import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import Instance from '../instance'

export default class Models {
  instance!: Instance

  scene!: THREE.Scene

  group!: THREE.Group

  fbxLoader!: FBXLoader

  skyloader!: THREE.CubeTextureLoader

  modelsList: string[] = []

  ball: Array<THREE.Group> = []

  door: Array<THREE.Group> = []

  whiteMaterial!: THREE.MeshStandardMaterial

  elevatarMaterial!: THREE.MeshStandardMaterial

  sliverMetalMaterial!: THREE.MeshStandardMaterial

  constructor() {
    this.instance = new Instance()
    const { scene } = this.instance
    this.scene = scene

    this.fbxLoader = new FBXLoader()
    this.skyloader = new THREE.CubeTextureLoader()

    this.group = new THREE.Group()
    this.group.name = 'showroom-group'

    this.initMaterials()
    this.initModels()
  }

  initMaterials() {
    const texture = this.skyloader.load([
      '/textures/skyBox4/posx.jpg',
      '/textures/skyBox4/negx.jpg',
      '/textures/skyBox4/posy.jpg',
      '/textures/skyBox4/negy.jpg',
      '/textures/skyBox4/posz.jpg',
      '/textures/skyBox4/negz.jpg'
    ])
    // 纯白色材质带环境贴图
    this.whiteMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0.447, // 金属度
      roughness: 0.115, // 粗糙度
      envMap: texture,
      envMapIntensity: 0.176
    })

    // 纯白色材质带环境贴图
    this.elevatarMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0.447, // 金属度
      roughness: 0.115, // 粗糙度
      envMap: texture,
      envMapIntensity: 0.3
    })

    // 银色金属材质
    this.sliverMetalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf8e2c6),
      metalness: 1, // 金属度
      roughness: 0, // 粗糙度
      envMap: texture,
      envMapIntensity: 1
    })
  }

  initModels() {
    this.modelsList = []
    for (let i = 1; i <= 8; i++) {
      this.modelsList.push(`/models/showroom-all/showroom_${i}.FBX`)
    }

    this.modelsList.forEach((item) => {
      this.fbxLoader.load(item, (group: THREE.Group) => {
        console.log(group)
        group.scale.set(0.003, 0.003, 0.003)
        group.traverse((child) => {
          const mesh = child as unknown as THREE.Mesh
          if (mesh.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        group.name = item.split('/')[3].split('.')[0]

        // 地面
        if (group.name === 'showroom_8') {
          // 加载贴图
          const floorMat = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            color: 0xffffff,
            metalness: 0,
            bumpScale: 1
          })

          const textureLoader = new THREE.TextureLoader()
          textureLoader.load('/models/showroom-all/floor.png', function (map) {
            map.wrapS = THREE.RepeatWrapping
            map.wrapT = THREE.RepeatWrapping
            map.anisotropy = 4
            map.repeat.set(4, 4)
            map.colorSpace = THREE.SRGBColorSpace
            floorMat.map = map
            floorMat.needsUpdate = true
          })

          // floor_Roughness.png，贴上floor的粗糙度
          textureLoader.load('/models/showroom-all/floor_Roughness.png', function (map) {
            map.wrapS = THREE.RepeatWrapping
            map.wrapT = THREE.RepeatWrapping
            map.anisotropy = 4
            map.repeat.set(4, 4)
            map.colorSpace = THREE.SRGBColorSpace
            floorMat.roughnessMap = map
            floorMat.needsUpdate = true
          })

          // 给mesh添加贴图
          group.traverse((child) => {
            const mesh = child as unknown as THREE.Mesh
            if (mesh.isMesh) {
              mesh.castShadow = true
              mesh.receiveShadow = true
              mesh.material = floorMat
            }
          })
        }

        // 基础墙体
        if (group.name === 'showroom_2') {
          group.traverse((child) => {
            const mesh = child as unknown as THREE.Mesh
            if (mesh.isMesh) {
              mesh.material = this.whiteMaterial
            }
          })
        }

        // 一号展台
        if (group.name === 'showroom_1') {
          // 移除showroom_1
          group.traverse((child) => {
            group.remove(child)
          })
        }

        // 球体3个
        const arr = ['showroom_3', 'showroom_4', 'showroom_5']
        arr.forEach((item) => {
          if (group.name === item) {
            group.traverse((child) => {
              const mesh = child as unknown as THREE.Mesh
              if (mesh.isMesh) {
                mesh.material = this.sliverMetalMaterial
                this.ball.push(group)
              }
            })
          }
        })

        // 电梯
        const elevatorArr = [
          {
            name: 'showroom_6',
            x: 0.26
          },
          {
            name: 'showroom_7',
            x: -0.199
          }
        ]
        elevatorArr.forEach((item) => {
          if (group.name === item.name) {
            group.traverse((child) => {
              const mesh = child as unknown as THREE.Mesh
              if (mesh.isMesh) {
                mesh.material = this.elevatarMaterial
                this.door.push(group)
              }
            })
            group.position.x = item.x
          }
        })

        // 给每个模型添加visible的GUI
        // const folder = gui.addFolder(object.name);
        // folder.add(object, "visible").name("是否显示");
        this.group.add(group)
      })
    })

    // 添加到场景
    this.group.rotateX(-Math.PI / 2)
    this.group.rotateZ(-Math.PI)
    this.scene.add(this.group)
  }
}
