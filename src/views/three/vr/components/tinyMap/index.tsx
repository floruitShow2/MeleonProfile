import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import './index.less'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
    },
    position: {
      type: Object as PropType<THREE.Vector2>,
      default: () => ({ x: 0, y: 0 })
    },
    rotation: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const { url, position, rotation } = toRefs(props)

    return () => (
      <div class="tiny-map">
        <i
          class="iconfont ws-shanxing"
          style={{
            left: `${position.value.x}px`,
            top: `${position.value.y}px`,
            transform: `rotate(${rotation.value}deg)`
          }}
        ></i>
        <img src={url.value} alt="" />
      </div>
    )
  }
})
