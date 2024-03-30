import * as THREE from 'three'
import Instance from '../instance'

export default class Light {
  instance!: Instance

  scene!: THREE.Scene

  light1!: THREE.DirectionalLight

  light2!: THREE.DirectionalLight

  spotLight1!: THREE.SpotLight

  spotLight2!: THREE.SpotLight

  spotLight3!: THREE.SpotLight

  constructor() {
    this.instance = new Instance()
    this.scene = this.instance.scene

    this.initDirectLights()
    this.initSpotLight()
  }

  initDirectLights() {
    this.light1 = new THREE.DirectionalLight(0xffe1c7, 20)
    this.light1.position.set(50, 45.1, -10.2) // 光源位置
    this.light1.castShadow = true
    this.light1.shadow.camera.near = 0.1
    this.light1.shadow.camera.far = 500
    this.light1.shadow.camera.left = -50
    this.light1.shadow.camera.right = 50
    this.light1.shadow.camera.top = 50
    this.light1.shadow.camera.bottom = -50
    this.light1.shadow.mapSize.width = 10240
    this.light1.shadow.mapSize.height = 10240

    this.light2 = new THREE.DirectionalLight(0xffffff, 2.3)
    this.light2.position.set(4.5, 36.5, 42.6)
    this.light2.shadow.camera.near = 0.1
    this.light2.shadow.camera.far = 100
    this.light2.shadow.camera.left = -20
    this.light2.shadow.camera.right = 20
    this.light2.shadow.camera.top = 20
    this.light2.shadow.camera.bottom = -20
    this.light2.shadow.mapSize.width = 4096
    this.light2.shadow.mapSize.height = 4096
    this.light2.target.position.set(0, 0, 0)

    this.scene.add(this.light1, this.light2)
  }

  initSpotLight() {
    // 添加聚光灯
    this.spotLight1 = new THREE.SpotLight(0xffffff, 20)
    this.spotLight1.position.set(2.1, 4.5, -1.6)
    this.spotLight1.castShadow = true

    // 聚光灯
    this.spotLight2 = new THREE.SpotLight(0xffffff, 5)
    this.spotLight2.position.set(-1.6843670113338225, 1.9, 1.2)
    this.spotLight2.target.position.set(-1.6843670113338225, 0, 1.2)

    this.spotLight2.angle = 0.5
    this.spotLight2.penumbra = 0.7 // 边缘软化
    this.spotLight2.castShadow = true
    this.scene.add(this.spotLight2)

    // 添加聚光灯3
    this.spotLight3 = new THREE.SpotLight(0xffffff, 9)
    this.spotLight3.position.set(-6.989796332110297, 1.0427591314401723, 3.2954104003906264)
    // 朝下照射
    this.spotLight3.target.position.set(-6.989796332110297, 0, 3.2954104003906264)
    this.spotLight3.castShadow = true
    this.scene.add(this.spotLight3)

    this.scene.add(this.spotLight1, this.spotLight2, this.spotLight3)
  }
}
