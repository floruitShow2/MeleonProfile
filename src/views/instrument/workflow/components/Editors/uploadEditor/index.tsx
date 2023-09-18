import { defineComponent, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@arco-design/web-vue'
import { workflowInjectionKey } from '@/views/instrument/workflow/core/key'
import { useDeepClone } from '@/utils/format'
import './index.less'

export default defineComponent({
  setup() {
    const workflow = inject(workflowInjectionKey)

    const { t } = useI18n()

    const nodeSettings = ref({
      title: ''
    })

    if (workflow) {
      const node = workflow.getActiveNode()
      if (node) nodeSettings.value = useDeepClone(node.data)
    }

    const onTitleChange = () => {
      if (!workflow) return
      const node = workflow.getActiveNode()
      if (!node) return
      node.data = nodeSettings.value
      workflow.updateActiveNode(node)
    }

    return () => (
      <div class="ws-upload-editor">
        <div class="ws-upload-editor_header">
          <i class="iconfont ws-upload"></i>
          <span>上传节点</span>
        </div>
        <div class="ws-upload-editor_base">
          <div class="title">通用设置</div>
          <div class="content">
            <div class="content-item">
              <span>节点名称</span>
              <Input
                v-model:modelValue={nodeSettings.value.title}
                size="mini"
                onBlur={onTitleChange}
              />
            </div>
          </div>
        </div>
        <div class="ws-upload-editor_base">
          <div class="title">特殊设置</div>
        </div>
      </div>
    )
  }
})
