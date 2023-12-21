import { defineComponent, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Select, Option } from '@arco-design/web-vue'
import { workflowInjectionKey } from '@/views/instrument/workflow/core/key'
import { useDeepClone } from '@/utils/format'
import './index.less'

export default defineComponent({
  setup() {
    const workflow = inject(workflowInjectionKey)

    const { t } = useI18n()

    const nodeSettings = ref({
      inputType: 'input'
    })

    const inputEdges = ref([
      {
        value: 'input',
        label: '输入框'
      },
      {
        value: 'select',
        label: '下拉选框'
      },
      {
        value: 'datetime',
        label: '时间选择器'
      }
    ])

    if (workflow && workflow.getActiveEdge()) {
      const edge = workflow.getActiveEdge()
      if (edge) nodeSettings.value = useDeepClone(edge.data)
    }

    const onInputTypeChange = () => {
      if (!workflow) return
      const edge = workflow.getActiveEdge()
      if (edge) {
        const newEdge = {
          ...edge,
          data: nodeSettings.value
        }
        workflow.updateActiveEdge(newEdge)
      }
    }

    return () => (
      <div class="ws-edge-editor">
        <div class="ws-edge-editor_header">
          <i class="iconfont ws-upload"></i>
          <span>连结线节点</span>
        </div>
        <div class="ws-edge-editor_base">
          <div class="title">通用设置</div>
          <div class="content">
            <div class="content-item">
              <span class="content-item_title">输入类型</span>
              <Select
                v-model:modelValue={nodeSettings.value.inputType}
                v-slots={{
                  default: () => {
                    return inputEdges.value.map((item) => (
                      <Option label={item.label} value={item.value}></Option>
                    ))
                  }
                }}
                size="mini"
                onChange={onInputTypeChange}
              />
            </div>
          </div>
        </div>
        <div class="ws-edge-editor_base">
          <div class="title">特殊设置</div>
        </div>
      </div>
    )
  }
})
