import { defineComponent, toRefs } from 'vue'
import WsNodeTemplate from '../tempalte/index'
import './index.less'

export default defineComponent({
  props: {
    class: String
  },
  setup(props) {
    const { class: className } = toRefs(props)
    return () => (
      <div class={['ws-nest-node', className.value]}>
        <WsNodeTemplate title="嵌套节点"></WsNodeTemplate>
      </div>
    )
  }
})
