import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import WsImageViewer from '@/components/imageViewer'
import './index.less'

export default defineComponent({
  props: {
    body: {
      type: Object as PropType<ApiChat.ImageBody>,
      required: true
    }
  },
  setup(props) {
    const { body } = toRefs(props)
    return () => (
      <WsImageViewer
        class="image-body"
        v-slots={{
          default: () => <img class="view-image" src={body.value.url} />
        }}
      />
    )
  }
})
