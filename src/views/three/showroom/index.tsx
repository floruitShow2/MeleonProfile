import { defineComponent, nextTick, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { Instance } from './core'
import './index.less'

export default defineComponent({
  setup() {
    const wrapperRef = ref<HTMLElement>()
    const canvasRef = ref<HTMLCanvasElement>()

    onMounted(() => {
      if (canvasRef.value && wrapperRef.value) {
        const core = new Instance({
          canvas: canvasRef.value,
          wrapper: wrapperRef.value,
          cameraOptions: {
            cameraAt: new THREE.Vector3(2, 1.1, -5)
          }
        })
        console.log(core)
      }
    })

    return () => (
      <div ref={wrapperRef} class="showroom">
        <canvas ref={canvasRef} class="showroom-scene"></canvas>
      </div>
    )
  }
})
