import { defineComponent, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { workflowInjectionKey } from '@/views/instrument/workflow/core/output'
import './index.less'

export default defineComponent({
  setup() {
    const workflow = inject(workflowInjectionKey)
    const { t } = useI18n()

    const toolNodes = ref<WorkFlow.NodeGroups>({
      base: ['code', 'upload', 'nest']
    })

    const handleAddNode = (nodeType: WorkFlow.NodeType) => {
      if (!workflow) return
      workflow.insertFlowNode(nodeType)
    }
    const handleDragEnd = (e: DragEvent, nodeType: WorkFlow.NodeType) => {
      if (!workflow || !e.target) return
      const { clientX, clientY } = e
      const { width: nodeWidth, height: nodeHeight } = (
        e.target as HTMLElement
      ).getBoundingClientRect()
      const { width, height, left, top } = workflow.wrapperRect
      if (
        clientX > left &&
        clientY > top &&
        clientX + nodeWidth < left + width &&
        clientY + nodeHeight < top + height
      ) {
        workflow.insertFlowNode(
          nodeType,
          clientX - left - nodeWidth / 2,
          clientY - top - nodeHeight / 2
        )
      }
    }

    return () => (
      <div class="ws-nodes-list">
        {Object.keys(toolNodes.value).map((group) => {
          return (
            <div class="component-group">
              <span class="component-group-title">{t(`workflow.tool.node.${group}`)}</span>
              <div class="component-group-items">
                {toolNodes.value[group as keyof WorkFlow.NodeGroups].map((node) => (
                  <div
                    class="node"
                    draggable
                    onDragend={(e) => handleDragEnd(e, node)}
                    onClick={() => handleAddNode(node)}
                  >
                    <i class={['iconfont', `ws-${node}`]}></i>
                    <span>{t(`workflow.tool.${node}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
