import { PropType, defineComponent, toRefs } from 'vue'
import WsFileCard from '@/components/fileCard'
import './index.less'

export default defineComponent({
  props: {
    body: {
      type: Object as PropType<ApiChat.FileBody>,
      required: true
    }
  },
  setup(props) {
    const { body } = toRefs(props)
    return () => (
      <WsFileCard
        class="file-body"
        filename={body.value.filename}
        filesize={body.value.size}
        tools={['view', 'download']}
      />
    )
  }
})
