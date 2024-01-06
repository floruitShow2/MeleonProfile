import { defineComponent, ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import VHall from './core'
import { DRAWS_RESOURCE } from './constants'
import './index.less'

export default defineComponent({
  setup() {
    const viewRef = ref()
    onMounted(() => {
      if (!viewRef.value) return
      nextTick(async () => {
        const vHall = new VHall({
          container: viewRef.value,
          debugger: false,
          cameraHeight: 0.1,
          cameraLookAt: new THREE.Vector3(1, 0.1, 1),
          cameraPosition: new THREE.Vector3(0, 0.1, 0)
        })
        await vHall.loadHall({
          url: 'http://localhost:3000/static/3DModels/hall/msg.gltf',
          floorName: 'meishu01',
          position: new THREE.Vector3(0, -2, 0),
          onProgress: (e) => {
            console.log(e)
          }
        })

        await vHall.loadDraws(DRAWS_RESOURCE, 0.01)
      })
    })

    return () => (
      <div class="vr-hall">
        <canvas ref={viewRef} id="container"></canvas>
      </div>
    )
  }
})
