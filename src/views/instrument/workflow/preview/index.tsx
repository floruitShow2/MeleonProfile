import { defineComponent, inject } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type {
  Connection,
  NodeMouseEvent,
  EdgeMouseEvent,
  NodeProps,
  EdgeProps
} from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { WorkFlowEvents, workflowInjectionKey } from '../core/output'
import WsEdgeInput from '../components/Edges/edInputEdge/index'
import { WsCodeNode, WsUploadNode, WsNestNode } from '../components/Nodes'
import './index.less'

export default defineComponent({
  setup() {
    const workflow = inject(workflowInjectionKey)

    const vueFlowSlots = {
      'node-code': () => <WsCodeNode />,
      'node-nest': (props: NodeProps) => <WsNestNode node={props} />,
      'node-upload': (props: NodeProps) => <WsUploadNode node={props} />,
      'edge-edInput': (props: EdgeProps) => <WsEdgeInput {...props} />
    }

    const onConnect = (e: Connection) => {
      if (!workflow) return
      workflow.insertFlowEdge(e)
    }

    const onEdgeClick = (e: EdgeMouseEvent) => {
      if (!workflow) return
      workflow.updateActiveEdge(e.edge)
    }

    const onNodeClick = (e: NodeMouseEvent) => {
      if (!workflow) return
      workflow.updateActiveNode(e.node)
      workflow.emit(WorkFlowEvents.onANC)
    }

    return () => (
      <div class="ws-flow-preview">
        <VueFlow
          v-slots={vueFlowSlots}
          delete-key-code={null}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
        />
        <MiniMap />
      </div>
    )
  }
})
