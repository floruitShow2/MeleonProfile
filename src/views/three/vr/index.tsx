import { defineComponent, ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import './index.less'

export default defineComponent({
  setup() {
    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let renderer: THREE.WebGLRenderer
    let sphere: THREE.Mesh
    let controls: OrbitControls

    const size = ref({
      width: 0,
      height: 0
    })
    function onWindowResize() {
      // camera.aspect = size.value.width / size.value.height
      // camera.updateProjectionMatrix()
      renderer.setSize(size.value.width, size.value.height)
    }

    function init() {
      const container = document.getElementById('container')

      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x101010)

      const light = new THREE.AmbientLight(0xffffff, 3)
      scene.add(light)

      const { width, height } = size.value
      camera = new THREE.PerspectiveCamera(90, width / height, 0.01, 2000)
      scene.add(camera)

      renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(size.value.width, size.value.height)
      renderer.xr.enabled = true
      renderer.xr.setReferenceSpaceType('local')
      if (container) {
        container.appendChild(renderer.domElement)
        // 添加轨道控制器
        controls = new OrbitControls(camera, renderer.domElement)
        controls.target.set(0, 0, 0)
        controls.enableDamping = true // 惯性效果
        controls.enableZoom = false
        controls.enablePan = false
        controls.minDistance = 0.01
        controls.maxDistance = 70
      }

      window.addEventListener('resize', onWindowResize)
    }

    function render() {
      // If we are not presenting move the camera a little so the effect is visible
      renderer.render(scene, camera)
      if (controls) controls.update()
    }

    function animate() {
      renderer.setAnimationLoop(render)
    }

    const containerRef = ref()

    const initSphere = () => {
      const sphereGeometry = new THREE.SphereGeometry(1, 50, 50)
      const texture = new THREE.TextureLoader().load('/textures/vr.webp')
      const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture })
      sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

      // On load complete add the panoramic sphere to the scene
      scene.add(sphere)
      sphere.geometry.scale(1, 1, -1)
      camera.position.set(0, 0, 0.01)
    }

    const poiObjects: THREE.Sprite[] = []
    const initPoints = () => {
      const points = [
        {
          position: new THREE.Vector3(0, 0, 0.9),
          title: '信息点1'
        },
        {
          position: new THREE.Vector3(0.9, 0, 0),
          title: '信息点2'
        },
        {
          position: new THREE.Vector3(0, 0.9, 0),
          title: '信息点3'
        }
      ]
      const pointTexture = new THREE.TextureLoader().load('/textures/edu.png')
      const material = new THREE.SpriteMaterial({ map: pointTexture, sizeAttenuation: false })

      for (let i = 0; i < points.length; i++) {
        const sprite = new THREE.Sprite(material)
        sprite.name = points[i].title
        sprite.scale.set(0.1, 0.1, 0.1)
        const { x, y, z } = points[i].position
        sprite.position.set(x, y, z)
        poiObjects.push(sprite)
        scene.add(sprite)
      }
    }

    const initHelper = () => {
      // const axes = new THREE.AxesHelper()
      // scene.add(axes)
    }

    const onMouseDown = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const { offsetLeft, offsetTop, clientWidth, clientHeight } = containerRef.value
      // dom.offsetLeft -- dom元素距离浏览器左侧的距离   dom.clientWidth -- dom元素宽度
      mouse.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1
      // dom.offsetTop -- dom元素距离浏览器顶部的距离    dom.clientHeight -- dom元素高度
      mouse.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(poiObjects, true)
      if (intersects.length > 0) {
        alert(`点击了热点【${intersects[0].object.name}】`)
      }
    }
    window.addEventListener('mousedown', onMouseDown, false)

    onMounted(() => {
      nextTick(() => {
        const { width, height } = containerRef.value.getBoundingClientRect()
        size.value = {
          width,
          height
        }
        init()
        initHelper()
        initSphere()
        initPoints()
        animate()
      })
    })

    return () => <div ref={containerRef} id="container" class="vr"></div>
  }
})
