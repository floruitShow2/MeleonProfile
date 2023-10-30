import { defineComponent, onMounted, ref } from 'vue'
// import { Application } from './General/Application'
import './index.less'

export default defineComponent({
  setup() {
    const canvasRef = ref()

    // const app = new Application({ $canvas: canvasRef.value })

    onMounted(() => {
      const $canvas = canvasRef.value as HTMLCanvasElement
      const c1 = $canvas.getContext('2d')
      if (!c1) return
      c1.fillRect(100, 100, 100, 100)
    })

    return () => (
      <div class="ws-journey">
        <canvas ref={canvasRef.value} width={200} height={200} />
      </div>
    )
  }
})
