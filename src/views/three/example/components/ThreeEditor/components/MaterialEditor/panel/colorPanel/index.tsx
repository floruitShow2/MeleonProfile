import { ref, defineComponent, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import './index.less'
import { useDeepClone } from '@/utils/format'

export default defineComponent({
  props: {
    instance: {
      type: Object as PropType<ThreeEditor.MaterialInstanceType>,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { instance } = toRefs(props)

    const copiedInstance = ref<ThreeEditor.MaterialInstanceType>()

    watch(
      instance,
      (newVal) => {
        copiedInstance.value = useDeepClone(newVal)
      },
      { deep: true, immediate: true }
    )

    const handleChange = useDebounceFn(() => {
      emit('update', copiedInstance.value)
    })
    return () => (
      <div class="color-panel">
        {copiedInstance.value && (
          <>
            <div class="color-panel-item">
              <span>颜色</span>
              <input
                type="color"
                v-model={copiedInstance.value.options.color}
                onChange={handleChange}
              />
            </div>
            <div class="color-panel-item">
              <span>不透明度</span>
              <input
                type="number"
                v-model={copiedInstance.value.options.opacity}
                onChange={handleChange}
              />
            </div>
          </>
        )}
      </div>
    )
  }
})
