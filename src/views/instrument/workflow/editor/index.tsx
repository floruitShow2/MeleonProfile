import { defineComponent, resolveComponent, defineAsyncComponent, ref, h, inject } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
// import type { GraphNode } from '@vue-flow/core'
import { workflowInjectionKey } from '../core/key'
import { WorkFlowEvents } from '../core/constants'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob(
  '../components/Editors/**/**.tsx'
)
const modules: any = {}
Object.keys(ms).forEach((key) => {
  const index = key.split('/')[3]
  modules[index] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    ...modules
  },
  setup() {
    const workflow = inject(workflowInjectionKey)
    const { t } = useI18n()

    const activeComponent = ref('code')

    if (workflow) {
      workflow.on(WorkFlowEvents.onAIDC, (id: string) => {
        const ele = workflow.getActiveElement(id)
        if (ele && ele.type) activeComponent.value = ele.type
      })
    }

    return () => (
      <div class="ws-flow-editor">
        {/* <Button type="primary" onClick={changeLanguage}>
          change language
        </Button> */}
        {h(resolveComponent(`${activeComponent.value}Editor`))}
      </div>
    )
  }
})
