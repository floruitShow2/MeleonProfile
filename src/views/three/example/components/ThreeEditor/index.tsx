import { ref, h, defineAsyncComponent, defineComponent, onMounted, resolveComponent } from 'vue'
import type { Component } from 'vue'
import { useBus } from '@/utils/global'
import { EditorEvents } from '@/views/three/example/type'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob('./components/*/index.tsx')
const modules: any = {}
Object.keys(ms).forEach((key) => {
  const idx = key.split('/')[2]
  modules[idx] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    ...modules
  },
  setup() {
    const $bus = useBus()

    // 当前激活的编辑器名称
    const currentEditor = ref<string>('')
    const editorConfig = ref<Record<string, any>>({
      Material: {}
    })

    onMounted(() => {
      $bus.on(EditorEvents.onMEO, (instance) => {
        currentEditor.value = 'Material'
        editorConfig.value.Material = instance as ThreeEditor.MaterialInstanceType
      })
    })

    const emitStandby = (editor: string) => {
      switch (editor) {
        case 'Material':
          $bus.emit(EditorEvents.onMC, editorConfig.value[editor])
          break
        default:
          break
      }
    }

    return () => (
      <div class="three-editor">
        {currentEditor.value &&
          h(resolveComponent(`${currentEditor.value}Editor`), {
            instance: editorConfig.value[currentEditor.value],
            onUpdate: (newVal: ThreeEditor.MaterialInstanceType) => {
              editorConfig.value[currentEditor.value] = newVal
              emitStandby(currentEditor.value)
            }
          })}
      </div>
    )
  }
})
