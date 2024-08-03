import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Form, FormItem, Input, Space, Button, Link, Checkbox } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import type { ValidatedError } from '@arco-design/web-vue/es/form/interface'
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import { useUserStore } from '@/store'
import { GithubAuth } from '@/api/auth'
import type { LoginData } from '@/api/auth'
import { useBus } from '@/utils/common'
import { localStg } from '@/utils/storage'
import { useLoading } from '@/hooks'
import './index.less'

export default defineComponent({
  name: 'PwdLoginForm',
  emits: ['navigate'],
  setup(props, { emit }) {
    // 路由
    const router = useRouter()
    // 国际化
    const { t: $t } = useI18n()
    const $bus = useBus()
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

    const handleAfterLogin = () => {
      Message.success($t('login.form.login.success'))

      const { redirect, ...othersQuery } = router.currentRoute.value.query

      router.push({
        name: (redirect as string) || 'workplace',
        query: {
          ...othersQuery
        },
        replace: true
      })
    }

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
          handleAfterLogin()
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

    /**
     * @description github 账号登录
     */
    const toGithubAuth = () => {
      const clientID = 'a21788e757ea3ad9aed4'
      const clientSecret = '324f0c65a35772ddfdb713ee02223d7f32063723'
      const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&client_secret=${clientSecret}&scope=user:email`

      window.open(url, '_self')
    }
    const handleGithubAuth = async (code: string) => {
      try {
        const { data } = await GithubAuth(code)
        if (!data) return
        if (data.accessToken) {
          // 用户已授权，可直接登录
          localStg.set('token', data.accessToken)
          handleAfterLogin()
        } else if (data.userId) {
          // 授权成功，用户信息已创建，跳转密码设置页面
          $bus.emit('onUserIdReceived', data.userId)
          emit('navigate', 'pwd-settle')
        }
      } catch (err) {
        console.log(err)
      }
    }

    onMounted(() => {
      const { query } = useRoute()
      if (query.code) {
        handleGithubAuth(query.code as string)
      }
    })

    return () => (
      <div class="login-form-wrapper">
        <div class="login-form-title">{$t('login.form.title')}</div>
        <div class="login-form-sub-title">{$t('login.form.subTitle')}</div>
        <div class="login-form-error-msg">{errorMessage.value}</div>
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
        <div>
          <Button onClick={toGithubAuth}>Github 登录</Button>
        </div>
      </div>
    )
  }
})
