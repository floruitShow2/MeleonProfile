import { PropType, defineComponent, inject, ref, toRefs } from 'vue'
import { Upload } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import type { NodeProps } from '@vue-flow/core'
import { workflowInjectionKey, WorkFlowEvents } from '../../../core/output'
import WsNodeTemplate from '../tempalte/index'
import './index.less'

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<NodeProps>,
      required: true
    }
  },
  setup(props) {
    const { node } = toRefs(props)
    const { id, data } = node.value
    const workflow = inject(workflowInjectionKey)
    const { t } = useI18n()

    const nodeId = ref(id)
    const nodeSettings = ref({
      title: data.title || ''
    })

    if (workflow) {
      workflow.on(WorkFlowEvents.onAIDC, (activeId: string) => {
        if (nodeId.value && nodeId.value !== activeId) return
        const activeNode = workflow.getActiveNode(activeId)
        if (activeNode) nodeSettings.value = activeNode.data
      })
    }

    // onMounted(() => {
    //   if (!workflow) return
    //   const node = workflow.getActiveNode()
    //   if (!node) return
    //   nodeId.value = node.id
    //   nodeSettings.value = node.data
    // })

    return () => (
      <div class="ws-upload-node">
        <WsNodeTemplate
          title={nodeSettings.value.title}
          v-slots={{
            default: () => (
              <div class="ws-upload-node_content">
                <Upload
                  draggable
                  v-slots={{
                    'upload-button': () => (
                      <div class="upload-button">
                        <i class="iconfont ws-upload"></i>
                        <span>{t('workflow.tool.upload.tooltip')}</span>
                      </div>
                    )
                  }}
                />
              </div>
            )
          }}
        ></WsNodeTemplate>
      </div>
    )
  }
})
