import { defineComponent, ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import VHall from './core'
import './index.less'

export default defineComponent({
  setup() {
    const viewRef = ref()
    onMounted(() => {
      if (!viewRef.value) return
      nextTick(async () => {
        const vHall = new VHall({ container: viewRef.value, cameraHeight: 1.75 })
        await vHall.loadHall({
          url: 'http://localhost:3000/static/3DModels/hall/msg.gltf',
          floorName: 'meishu01',
          position: new THREE.Vector3(0, -2, 0),
          onProgress: (e) => {
            console.log(e)
          }
        })
      })
    })

    return () => (
      <div class="vr-hall">
        <canvas ref={viewRef} id="container"></canvas>
      </div>
    )
  }
})
