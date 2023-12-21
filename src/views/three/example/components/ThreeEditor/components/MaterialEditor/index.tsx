import { ref, defineComponent, toRefs, h, resolveComponent, defineAsyncComponent } from 'vue'
import type { Component, PropType } from 'vue'
import { CheckboxGroup, Checkbox } from '@arco-design/web-vue'
import { MaterialCard } from '@/views/three/example/components'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob('./panel/*/index.tsx')
const modules: any = {}
Object.keys(ms).forEach((key) => {
  const k = key.split('/')[2]
  modules[k] = defineAsyncComponent(ms[key])
})
export default defineComponent({
  components: {
    ...modules
  },
  props: {
    instance: {
      type: Object as PropType<ThreeEditor.MaterialInstanceType>,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { instance } = toRefs(props)

    const options = ref([
      {
        key: 'color',
        label: '颜色'
      }
    ])
    const checkedValue = ref<string[]>(['color'])
    const currentCategory = ref<string>('color')
    const handleCategoryClick = (key: string) => {
      currentCategory.value = key
    }
    return () => (
      <div class="material-editor">
        <div class="material-editor-category">
          <MaterialCard instance={instance.value} />
          <CheckboxGroup v-model:modelValue={checkedValue.value} direction="vertical">
            {options.value.map((item) => (
              <div class="category-item">
                <Checkbox value={item.key} />
                <span
                  class={{
                    'is-active': item.key === currentCategory.value
                  }}
                  onClick={() => handleCategoryClick(item.key)}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CheckboxGroup>
        </div>
        <div class="material-editor-content">
          {h(resolveComponent(`${currentCategory.value}Panel`), {
            instance: instance.value,
            onUpdate: (newVal: ThreeEditor.MaterialInstanceType) => {
              emit('update', newVal)
            }
          })}
        </div>
      </div>
    )
  }
})
