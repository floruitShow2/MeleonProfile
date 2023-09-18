import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import * as THREE from 'three'
import type { MaterialInstanceType } from '../interface'
import './index.less'

export default defineComponent({
  props: {
    instance: {
      type: Object as PropType<MaterialInstanceType>,
      required: true
    }
  },
  setup(props) {
    const { instance } = toRefs(props)

    const previewRef = ref()
    let scene: THREE.Scene | null = null
    let renderer: THREE.Renderer | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let light: THREE.PointLight | null = null

    const initMaterial = (newVal: MaterialInstanceType) => {
      const width = 70
      const height = 50
      scene = new THREE.Scene()
      scene.background = new THREE.Color('#808080')

      camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000)
      camera.position.z = 2

      renderer = new THREE.WebGLRenderer({ canvas: previewRef.value })
      renderer.setSize(width, height)
      const geometry = new THREE.SphereGeometry(1, 2, 2)
      console.log(newVal)
      const material = new THREE.MeshPhongMaterial(newVal.options)
      const sphere = new THREE.Mesh(geometry, material)

      light = new THREE.PointLight(0xffffff, 1, 100)
      light.position.set(20, 20, 20)
      scene.add(sphere, light)

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

    return () => (
      <div class="material-card">
        <canvas ref={previewRef} class="preview"></canvas>
        <div class="label">
          <span>{instance.value.name}</span>
        </div>
      </div>
    )
  }
})
