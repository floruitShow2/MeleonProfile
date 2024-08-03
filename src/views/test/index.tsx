import { defineComponent, ref } from 'vue'
import Modeler from 'bpmn-js/lib/Modeler'
import BpmnDesigner from '@/components/Designer/index.vue'
import BpmnPanel from '@/components/Panel/index.vue'
import { modelerKey } from '@/injection-keys'
import BpmnToolbar from '@/components/Toolbar/BpmnToolbar.vue'
import style from './index.module.less'

export default defineComponent({
  setup() {
    // defineOptions({ name: 'App' })

    const provideModeler = shallowRef<Modeler | undefined>()
    const setCurrentModeler = (modeler: Modeler) => {
      provideModeler.value = modeler
    }
    provide(modelerKey, provideModeler)

    return () => (
      <div class={style['test-wrapper']}>
        <BpmnToolbar />
        <BpmnDesigner onModelerInit={setCurrentModeler} />
        <BpmnPanel />
      </div>
    )
  }
})
