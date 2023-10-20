import { defineComponent, ref } from 'vue'
import { Application } from './General/Application'
import './index.less'

export default defineComponent({
  setup() {
    const canvasRef = ref()

    const app = new Application(canvasRef.value)

    return () => (
      <div class="ws-journey">
        <canvas ref={canvasRef.value} />
      </div>
    )
  }
})
