import { defineComponent, computed, ref, inject } from 'vue'
import { EdgeLabelRenderer, BaseEdge, getBezierPath } from '@vue-flow/core'
import { Input, Select } from '@arco-design/web-vue'
import { WorkFlowEvents, workflowInjectionKey } from '@/views/instrument/workflow/core/output'
import './index.less'

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'input'
    },
    id: {
      type: String,
      required: true
    },
    sourceX: {
      type: Number,
      required: true
    },
    sourceY: {
      type: Number,
      required: true
    },
    targetX: {
      type: Number,
      required: true
    },
    targetY: {
      type: Number,
      required: true
    },
    sourcePosition: {
      type: String,
      required: true
    },
    targetPosition: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: false,
      default: () => ({ inputType: 'input' })
    },
    markerEnd: {
      type: String,
      required: false
    },
    style: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const workflow = inject(workflowInjectionKey)
    const path = computed(() => getBezierPath(props as any))
    const inputValue = ref('')
    inputValue.value = props.data ? props.data.text || '' : ''

    const edgeInputComponent = ref(
      <Input v-model:modelValue={inputValue.value} size="mini" placeholder="请输入" />
    )

    if (workflow) {
      workflow.on(WorkFlowEvents.onAIDC, (id: string) => {
        const edge = workflow.getActiveEdge(id)
        if (!edge) return
        const { inputType } = edge.data
        switch (inputType) {
          case 'select':
            edgeInputComponent.value = <Select size="mini" placeholder="请选择"></Select>
            break
          default:
            edgeInputComponent.value = (
              <Input v-model:modelValue={inputValue.value} size="mini" placeholder="请输入" />
            )
            break
        }
      })
    }

    return () => (
      <>
        <BaseEdge
          id={props.id}
          style={props.style}
          path={path.value[0]}
          marker-end={props.markerEnd}
        />
        <EdgeLabelRenderer>
          <div
            style={{
              pointerEvents: 'all',
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${path.value[1]}px,${path.value[2]}px)`
            }}
            class="nodrag nopan"
          >
            {edgeInputComponent.value}
          </div>
        </EdgeLabelRenderer>
      </>
    )
  }
})
