import {
  defineAsyncComponent,
  defineComponent,
  Transition,
  KeepAlive,
  h,
  resolveComponent,
  ref,
  computed
} from 'vue'
import type { Component } from 'vue'
import './index.less'
import { useI18n } from 'vue-i18n'

/**
 * @description 个人设置
 */
const ms: Record<string, () => Promise<Component>> = import.meta.glob('./components/**/**.tsx')
const modules: Record<string, Component> = {}
Object.keys(ms).forEach((key) => {
  const marker = key.split('/')[2]
  modules[marker] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    ...modules
  },
  setup() {
    const { t: $t } = useI18n()

    const menuData = computed(() => {
      return [
        {
          label: $t('settings.basic'),
          code: 'BasicSetting'
        },
        {
          label: $t('settings.security'),
          code: 'SecuritySetting'
        }
      ]
    })
    const activeMenu = ref<string>('BasicSetting')

    const handleMenuItemClick = (code: string) => {
      activeMenu.value = code
    }

    return () => (
      <div class="settings-view">
        <div class="settings-view-wrapper">
          <ul class="settings-view-wrapper--menu">
            {menuData.value.map((item) => (
              <li
                class={{
                  'menu-item': true,
                  'menu-item--active': activeMenu.value === item.code
                }}
                onClick={() => handleMenuItemClick(item.code)}
              >
                {item.label}
              </li>
            ))}
          </ul>
          <div class="settings-view-wrapper--content">
            <Transition mode="out-in" name="fade-slide">
              <KeepAlive>{h(resolveComponent(activeMenu.value))}</KeepAlive>
            </Transition>
          </div>
        </div>
      </div>
    )
  }
})
