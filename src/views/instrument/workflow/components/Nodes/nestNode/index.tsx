import { PropType, defineComponent, toRefs } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import WsNodeTemplate from '../tempalte/index'
import './index.less'

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<NodeProps>
    }
  },
  setup(props) {
    const { node } = toRefs(props)
    console.log(node)
    return () => (
      <div class={['ws-nest-node']}>
        <WsNodeTemplate title="嵌套节点"></WsNodeTemplate>
      </div>
    )
  }
})
