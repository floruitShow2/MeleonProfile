import { defineComponent, defineAsyncComponent, inject, ref, h, resolveComponent } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { workflowInjectionKey } from '../core/key'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob(
  '../components/Tools/**/**.tsx'
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

    const toolMenus = ref(['node', 'template'])
    const activeMenu = ref('node')

    const isFolded = ref(false)

    const onMenuItemClick = (menu: string) => {
      activeMenu.value = menu
      if (isFolded.value) isFolded.value = false
    }
    const handleToolClose = () => {
      if (!workflow) return
      isFolded.value = !isFolded.value
    }

    return () => (
      <div
        class={{
          'ws-flow-toolbar': true,
          'is-fold': isFolded.value
        }}
      >
        <div class="ws-flow-toolbar-menu">
          {toolMenus.value.map((menu) => (
            <div
              class={{
                item: true,
                'is-active': activeMenu.value === menu
              }}
            >
              <i class={`iconfont ws-${menu}`} onClick={() => onMenuItemClick(menu)}></i>
              <span>{t(`workflow.tool.menu.${menu}`)}</span>
            </div>
          ))}
        </div>
        <div class="ws-flow-toolbar-component">
          {h(resolveComponent(`${activeMenu.value}List`))}
        </div>
        <div class="ws-flow-toolbar-btn" onClick={handleToolClose}>
          <i class="iconfont ws-arrow-left" />
        </div>
      </div>
    )
  }
})
