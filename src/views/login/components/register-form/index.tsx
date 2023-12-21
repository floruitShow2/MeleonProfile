import { defineComponent, ref } from 'vue'
import { Message, Form, FormItem, Input, Space, Button } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import { ValidatedError } from '@arco-design/web-vue/es/form/interface'
import { useI18n } from 'vue-i18n'
import useLoading from '@/hooks/loading'
import { register } from '@/api/auth'
import type { LoginData } from '@/api/auth'
import './index.less'

export default defineComponent({
  name: 'RegisterForm',
  emits: ['navigate'],
  setup(props, { emit }) {
    const { t: $t } = useI18n()
    const errorMessage = ref('')
    const { loading, setLoading } = useLoading()

    const userInfo = ref({
      username: '', // 演示默认值
      password: '' // demo default value
    })

    const toLoginModule = (key: UnionKey.LoginModule) => {
      emit('navigate', key)
    }

    const handleRegister = async ({
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
          const { data } = await register(values as LoginData)
          if (!data) return
          Message.success($t('register.form.success'))
          toLoginModule('pwd-login')
          // 实际生产环境需要进行加密存储。
          // The actual production environment requires encrypted storage.
        } catch (err) {
          errorMessage.value = (err as Error).message
        } finally {
          setLoading(false)
        }
      }
    }

    return () => (
      <div class="login-form-wrapper">
        <div class="login-form-title">{$t('register.form.title')}</div>
        <div class="login-form-sub-title">{$t('register.form.subTitle')}</div>
        <div class="login-form-error-msg">{errorMessage}</div>
        <Form
          ref="loginForm"
          model={userInfo}
          class="login-form"
          layout="vertical"
          onSubmit={handleRegister}
        >
          <FormItem
            field="username"
            rules={[{ required: true, message: $t('login.form.userName.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.value.username}
              placeholder={$t('register.form.userName.placeholder')}
              v-slots={{
                prefix: () => <IconUser />
              }}
            ></Input>
          </FormItem>
          <FormItem
            field="password"
            rules={[{ required: true, message: $t('login.form.password.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.value.password}
              allow-clear
              type="password"
              placeholder={$t('register.form.password.placeholder')}
              v-slots={{
                prefix: () => <IconLock />
              }}
            />
          </FormItem>
          <Space size={16} direction="vertical">
            <Button type="primary" html-type="submit" long loading={loading.value}>
              {$t('register.form.confirm')}
            </Button>
            <Button type="text" long onClick={() => toLoginModule('pwd-login')}>
              {$t('register.form.cancel')}
            </Button>
          </Space>
        </Form>
      </div>
    )
  }
})
