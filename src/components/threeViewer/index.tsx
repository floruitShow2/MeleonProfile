import { defineComponent, nextTick, onMounted, ref } from 'vue'
import Experience from './General/Experience'
import './index.less'

export { Experience }
export * from './interface'

export default defineComponent({
  props: {
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 300
    }
  },
  setup(props, { expose }) {
    // const { width, height } = toRefs(props)

    const canvasWrapperRef = ref()
    const canvasRef = ref()

    const experience = ref<null | Experience>(null)

    onMounted(() => {
      experience.value = new Experience(canvasRef.value, canvasWrapperRef.value)
      setTimeout(() => {
        if (experience.value) {
          experience.value.sizes.resize()
        }
      }, 1000)
    })

    expose({
      experience
    })

    return () => (
      <div class="three-viewer" ref={canvasWrapperRef}>
        <canvas ref={canvasRef}></canvas>
      </div>
    )
  }
})
