import { defineComponent, nextTick, onMounted, ref } from 'vue'
import Experience from './General/Experience'
import {
  ThreeToolTab,
  ThreeShortCut,
  ThreeLayers,
  ThreeEditor,
  MaterialManager
} from './components'
import './index.less'

export default defineComponent({
  setup() {
    const canvasWrapperRef = ref()
    const canvasRef = ref()

    const experience = ref<null | Experience>(null)
    onMounted(() => {
      experience.value = new Experience(canvasRef.value, canvasWrapperRef.value)
    })

    const isMaterialShow = ref(true)
    const handleToolSelect = (value: string | number | Record<string, any>) => {
      if (value === 'window-material') {
        isMaterialShow.value = !isMaterialShow.value
      }
    }

    return () => (
      <div class="ws-three">
        <div class="ws-three-main">
          <div class="tools">
            <ThreeToolTab onSelect={handleToolSelect} />
            <ThreeShortCut />
          </div>
          <div ref={canvasWrapperRef} class="experience">
            <canvas ref={canvasRef} class="experience-canvas"></canvas>
            <div
              class="material"
              style={{
                width: isMaterialShow.value ? '200px' : 0
              }}
            >
              <MaterialManager />
            </div>
          </div>
        </div>
        <div class="ws-three-aside">
          {experience.value && <ThreeLayers experience={experience.value} />}
          <ThreeEditor />
        </div>
      </div>
    )
  }
})
