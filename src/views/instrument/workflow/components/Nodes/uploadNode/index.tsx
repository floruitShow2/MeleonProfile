import { PropType, defineComponent, inject, ref, toRefs } from 'vue'
import { Upload } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { workflowInjectionKey, WorkFlowEvents } from '../../../core/output'
import WsNodeTemplate from '../tempalte/index'
import './index.less'

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    data: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({
        title: '文件上传'
      })
    }
  },
  setup(props) {
    const { id, data } = toRefs(props)
    const workflow = inject(workflowInjectionKey)
    const { t } = useI18n()

    const nodeId = ref(id.value)
    const nodeSettings = ref({
      title: props.data.title
    })

    if (workflow) {
      workflow.on(WorkFlowEvents.onAIDC, (activeId: string) => {
        if (nodeId.value && nodeId.value !== activeId) return
        const node = workflow.getActiveNode(activeId)
        if (node) nodeSettings.value = node.data
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
