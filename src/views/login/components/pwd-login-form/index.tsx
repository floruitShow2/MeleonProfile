import { defineComponent, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Form, FormItem, Input, Space, Button, Link, Checkbox } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import { ValidatedError } from '@arco-design/web-vue/es/form/interface'
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import { useUserStore } from '@/store'
import useLoading from '@/hooks/loading'
import type { LoginData } from '@/api/auth'

import './index.less'

export default defineComponent({
  name: 'PwdLoginForm',
  emits: ['navigate'],
  setup(props, { emit }) {
    const router = useRouter()
    const { t: $t } = useI18n()
    const errorMessage = ref('')
    const { loading, setLoading } = useLoading()
    const userStore = useUserStore()

    const loginConfig = useStorage('login-config', {
      rememberPassword: true,
      username: 'meleon', // 演示默认值
      password: '232000' // demo default value
    })
    const userInfo = reactive({
      username: loginConfig.value.username,
      password: loginConfig.value.password
    })

    const handleSubmit = async ({
      errors,
      values
    }: {
      errors: Record<string, ValidatedError> | undefined
      values: Record<string, any>
    }) => {
      if (loading.value) return
      if (!errors) {
        setLoading(true)
        try {
          await userStore.login(values as LoginData)
          const { rememberPassword } = loginConfig.value
          const { username, password } = values
          // 实际生产环境需要进行加密存储。
          // The actual production environment requires encrypted storage.
          loginConfig.value.username = rememberPassword ? username : ''
          loginConfig.value.password = rememberPassword ? password : ''
          Message.success($t('login.form.login.success'))

          const { redirect, ...othersQuery } = router.currentRoute.value.query

          router.push({
            name: (redirect as string) || 'workplace',
            query: {
              ...othersQuery
            },
            replace: true
          })
        } catch (err) {
          errorMessage.value = (err as Error).message
        } finally {
          setLoading(false)
        }
      }
    }
    const setRememberPassword = (value: boolean) => {
      loginConfig.value.rememberPassword = value
    }

    const toLoginModule = (key: UnionKey.LoginModule) => {
      emit('navigate', key)
    }

    return () => (
      <div class="login-form-wrapper">
        <div class="login-form-title">{$t('login.form.title')}</div>
        <div class="login-form-sub-title">{$t('login.form.subTitle')}</div>
        <div class="login-form-error-msg">{errorMessage}</div>
        <Form
          ref="loginForm"
          model={userInfo}
          class="login-form"
          layout="vertical"
          onSubmit={handleSubmit}
        >
          <FormItem
            field="username"
            rules={[{ required: true, message: $t('login.form.userName.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.username}
              placeholder={$t('login.form.userName.placeholder')}
              v-slots={{
                prefix: () => <IconUser />
              }}
            />
          </FormItem>
          <FormItem
            field="password"
            rules={[{ required: true, message: $t('login.form.password.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.password}
              type="password"
              placeholder={$t('login.form.password.placeholder')}
              allow-clear
              v-slots={{
                prefix: () => <IconLock />
              }}
            />
          </FormItem>
          <Space size={16} direction="vertical">
            <div class="login-form-password-actions">
              <Checkbox
                model-value={loginConfig.value.rememberPassword}
                onChange={setRememberPassword as any}
              >
                {$t('login.form.rememberPassword')}
              </Checkbox>
              <Link>{$t('login.form.forgetPassword')}</Link>
            </div>
            <Button type="primary" html-type="submit" long loading={loading.value}>
              {$t('login.form.login')}
            </Button>
            <Button
              type="text"
              long
              class="login-form-register-btn"
              onClick={() => toLoginModule('register')}
            >
              {$t('login.form.register')}
            </Button>
          </Space>
        </Form>
      </div>
    )
  }
})
