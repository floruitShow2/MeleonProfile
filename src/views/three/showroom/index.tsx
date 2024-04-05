import { computed, defineComponent, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { Instance } from './core'
import './index.less'

export default defineComponent({
  setup() {
    const wrapperRef = ref<HTMLElement>()
    const canvasRef = ref<HTMLCanvasElement>()

    const LocationArr: Array<Record<'x' | 'y' | 'z', number>> = [
      {
        x: 2, // 18.8
        y: 1.1,
        z: -4
      },
      {
        x: 13.4 - 16.4,
        y: 0.8,
        z: -4
      },
      {
        x: 10 - 16.8,
        y: 0.8,
        z: -4
      },
      {
        x: 5.8 - 16.8,
        y: 0.8,
        z: -4
      },
      {
        x: 0.6 - 16.8,
        y: 1.3,
        z: -6
      },
      {
        x: -4 - 16.8,
        y: 0.8,
        z: -4
      },
      {
        x: -9.2 - 16.8,
        y: 3,
        z: -4
      }
    ]

    const curIndex = ref(0)
    const curPosition = computed(() => {
      const { x, y, z } = LocationArr[curIndex.value]
      return new THREE.Vector3(x, y, z)
    })

    const core = ref<Instance>()

    onMounted(() => {
      if (canvasRef.value && wrapperRef.value) {
        core.value = new Instance({
          canvas: canvasRef.value,
          wrapper: wrapperRef.value,
          cameraOptions: {
            cameraAt: curPosition.value
          }
        })
      }
    })

    const handleIndicatorClick = (index: number) => {
      if (index < 0 && index >= LocationArr.length) return
      curIndex.value = index
      core.value?.changeCameraLocation(curPosition.value)
    }

    return () => (
      <div ref={wrapperRef} class="showroom">
        <canvas ref={canvasRef} class="showroom-scene"></canvas>

        <div class="showroom-indicator">
          <i
            class="iconfont ws-arrow-left ibtn_base ibtn_hover"
            onClick={() => handleIndicatorClick(curIndex.value - 1)}
          ></i>
          <i
            class="iconfont ws-arrow-right ibtn_base ibtn_hover"
            onClick={() => handleIndicatorClick(curIndex.value + 1)}
          ></i>
        </div>
      </div>
    )
  }
})
