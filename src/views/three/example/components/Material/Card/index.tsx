import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import * as THREE from 'three'
import './index.less'

export default defineComponent({
  props: {
    instance: {
      type: Object as PropType<ThreeEditor.MaterialInstanceType>,
      required: true
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const { instance } = toRefs(props)

    const previewRef = ref()
    let scene: THREE.Scene | null = null
    let renderer: THREE.Renderer | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let mirrorSphereCamera: THREE.CubeCamera | null = null
    let light: THREE.DirectionalLight | null = null
    let sphere: THREE.Mesh | null = null

    const initRenderer = () => {
      const width = 60
      const height = 50

      camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000)
      camera.position.z = 2

      renderer = new THREE.WebGLRenderer({ canvas: previewRef.value })
      renderer.setSize(width, height)
    }

    const initSphere = (value: ThreeEditor.MaterialInstanceType) => {
      const geometry = new THREE.SphereGeometry(1, 150, 150)
      const material = new THREE.MeshPhongMaterial(value.options)
      sphere = new THREE.Mesh(geometry, material)
      sphere.receiveShadow = true
      if (scene) scene.add(sphere)
    }

    const initLight = () => {
      light = new THREE.DirectionalLight(0xffffff, 2)
      light.castShadow = true
      light.position.set(-2, 2, 5)
      if (scene) scene.add(light)
    }

    const initReflect = () => {
      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024)
      mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget)
      if (scene) scene.add(mirrorSphereCamera)
      const mirrorSphereMaterial = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture })
      if (sphere) sphere.material = mirrorSphereMaterial
    }

    const initMaterial = (newVal: ThreeEditor.MaterialInstanceType) => {
      scene = new THREE.Scene()
      scene.background = new THREE.Color('#555555')

      initRenderer()

      initSphere(newVal)

      initLight()

      // initReflect()

      const animate = () => {
        requestAnimationFrame(animate)
        if (renderer && scene && camera) {
          renderer.render(scene, camera)
        }
      }
      animate()
    }

    watch(instance, initMaterial, { deep: true, immediate: false })

    onMounted(() => {
      if (instance.value) initMaterial(instance.value)
    })

    const handleCardClick = () => {
      emit('click', instance.value)
    }

    return () => (
      <div class="material-card" onClick={handleCardClick}>
        <canvas ref={previewRef} class="preview" draggable />
        <div class="label">
          <span>{instance.value.name}</span>
        </div>
      </div>
    )
  }
})
