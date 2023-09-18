import { defineComponent, nextTick, onMounted, provide, ref } from 'vue'
import WsFlowToolbar from './toolbar/index'
import WsFlowPreview from './preview/index'
import WsFlowEditor from './editor/index'
import Workflow from './core/index'
import { workflowInjectionKey } from './core/key'
import './index.less'

export default defineComponent({
  setup() {
    const workflow = new Workflow()

    const wrapperRef = ref()

    onMounted(() => {
      nextTick(() => {
        if (wrapperRef.value) workflow.updateWrapperSize(wrapperRef.value.$el)
      })
    })

    provide(workflowInjectionKey, workflow)

    // window.onkeydown = (e) => {
    //   e.preventDefault()
    // }

    return () => (
      <div class="ws-flow">
        <WsFlowToolbar />
        <WsFlowPreview ref={wrapperRef} />
        <WsFlowEditor />
      </div>
    )
  }
})
