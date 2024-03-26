import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Form, FormItem, Input, Space, Button, Message } from '@arco-design/web-vue'
import { IconLock } from '@arco-design/web-vue/es/icon'
import { useLoading } from '@/hooks'
import { fillPassword } from '@/api/auth'
import { useBus } from '@/utils/common'
import './index.less'
import { localStg } from '@/utils/storage'

export default defineComponent({
  name: 'PwdSettleForm',
  setup() {
    const router = useRouter()

    const { t: $t } = useI18n()
    const $bus = useBus()
    const { loading, setLoading } = useLoading()

    const userId = ref<string>('')
    const userInfo = reactive({
      pwd: '',
      confirmPwd: ''
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

    const handleSubmit = async () => {
      console.log(userId.value)
      setLoading(true)

      try {
        const { data } = await fillPassword(userId.value, userInfo.pwd)
        if (!data) {
          Message.error({
            content: '注册失败'
          })
          return
        }

        localStg.set('token', data.accessToken)
        handleAfterLogin()
      } catch (err) {
        console.log(err)
      }
    }

    onMounted(() => {
      $bus.on('onUserIdReceived', (id) => {
        userId.value = id as string
      })
    })

    return () => (
      <div class="login-form-wrapper">
        <div class="login-form-title">{$t('login.form.title')}</div>
        <div class="login-form-sub-title">{$t('login.form.subTitle')}</div>
        <div class="login-form-error-msg"></div>
        <Form
          ref="loginForm"
          model={userInfo}
          class="login-form"
          layout="vertical"
          onSubmit={handleSubmit}
        >
          <FormItem
            field="pwd"
            rules={[{ required: true, message: $t('login.form.password.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.pwd}
              type="password"
              placeholder={$t('login.form.password.placeholder')}
              allow-clear
              v-slots={{
                prefix: () => <IconLock />
              }}
            />
          </FormItem>
          <FormItem
            field="confirmPwd"
            rules={[{ required: true, message: $t('login.form.password.errMsg') }]}
            validate-trigger={['change', 'blur']}
            hide-label
          >
            <Input
              v-model={userInfo.confirmPwd}
              type="password"
              placeholder={$t('login.form.confirm.placeholder')}
              allow-clear
              v-slots={{
                prefix: () => <IconLock />
              }}
            />
          </FormItem>
          <Space size={16} direction="vertical">
            <Button type="primary" html-type="submit" long loading={loading.value}>
              {$t('login.form.login')}
            </Button>
          </Space>
        </Form>
      </div>
    )
  }
})
