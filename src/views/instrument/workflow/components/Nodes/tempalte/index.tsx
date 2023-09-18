import { defineComponent } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import './index.less'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    return () => (
      <div class="ws-node-template">
        <Handle type="source" position={Position.Top}></Handle>
        <div class="ws-node-header">
          <span title={props.title}>{props.title}</span>
          <div class="tools">{/* <i class="iconfont ws-more ibtn_base"></i> */}</div>
        </div>
        <div class="ws-node-content">{slots.default && slots.default()}</div>
        <Handle type="source" position={Position.Bottom}></Handle>
      </div>
    )
  }
})
