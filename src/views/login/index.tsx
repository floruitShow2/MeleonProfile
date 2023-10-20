import {
  defineComponent,
  KeepAlive,
  resolveComponent,
  Transition,
  ref,
  h,
  defineAsyncComponent
} from 'vue'

import type { Component } from 'vue'
import Meleon from '@/assets/images/Meleon.png'
import LoginBanner from './components/banner.vue'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob('./components/**/**.tsx')
const modules: Record<string, Component> = {}
Object.keys(ms).forEach((key) => {
  const marker = key.split('/')[2]
  modules[marker] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    PwdLoginForm: defineAsyncComponent(() => import('./components/pwd-login-form')),
    RegisterForm: defineAsyncComponent(() => import('./components/register-form'))
  },
  setup() {
    // interface LoginModule {
    //   key: UnionKey.LoginModule
    //   label: string
    //   component: Component
    // }

    // const modules: LoginModule[] = [
    //   {
    //     key: 'pwd-login',
    //     label: loginModuleLabels['pwd-login'],
    //     component: defineAsyncComponent(() => import('./components/login-form'))
    //   },
    //   {
    //     key: 'register',
    //     label: loginModuleLabels.register,
    //     component: defineAsyncComponent(() => import('./components/register-form'))
    //   }
    // ]
    const activeModuleKey = ref<UnionKey.LoginModule>('pwd-login')
    // const activeModule = computed(() => {
    //   const active: LoginModule = { ...modules[0] }
    //   const findItem = modules.find((item) => item.key === activeModuleKey.value)
    //   return findItem ?? active
    // })

    const toLoginModule = (key: UnionKey.LoginModule) => {
      activeModuleKey.value = key
    }

    return () => (
      <div class="container">
        <div class="logo">
          <img alt="logo" src={Meleon} height="15" />
          <div class="logo-text">Meleon Profile</div>
        </div>
        <LoginBanner />
        <div class="content">
          <div class="content-inner">
            <div class="pt-5">
              <Transition name="fade-slide" mode="out-in" appear>
                <KeepAlive>
                  {h(resolveComponent(`${activeModuleKey.value}-form`), {
                    onNavigate: toLoginModule
                  })}
                </KeepAlive>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
