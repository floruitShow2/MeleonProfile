import { computed, defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Space, Input, Button, Message, FieldRule } from '@arco-design/web-vue'
import type { ValidatedError } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { updatePassword } from '@/api/auth'
import './index.less'

export default defineComponent({
  setup() {
    const { t: $t } = useI18n()

    const pwds = ref<ApiAuth.PasswordsType>({
      oldPwd: '',
      newPwd: '',
      confirmPwd: ''
    })

    const rules = computed<Record<string, FieldRule[]>>(() => ({
      defaultPwd: [
        { required: true, message: $t('settings.security.rule.required') },
        {
          minLength: 6,
          message: $t('settings.security.rule.length')
        }
      ],
      customPwd: [
        { required: true, message: $t('settings.security.rule.required') },
        {
          match: /^(.{15,}|(?=.*[0-9])(?=.*[a-z]).{8,})$/,
          message: $t('settings.security.rule.validate')
        }
      ]
    }))

    const formRef = ref()
    const handleFormReset = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    const handleUpdatePwd = async (result: {
      values: Record<string, any>
      errors: Record<string, ValidatedError> | undefined
    }) => {
      const { values, errors } = result
      if (errors) return
      const { data } = await updatePassword(values as ApiAuth.PasswordsType)
      if (data) {
        // handleFormReset()
        Message.info({
          content: $t('settings.security.message')
        })
      }
    }

    return () => (
      <div class="security-setting">
        <h4 class="security-setting-title">{$t('settings.security.title')}</h4>
        <div class="security-setting-content">
          <Form ref={formRef} model={pwds.value} layout="vertical" onSubmit={handleUpdatePwd}>
            <FormItem
              field="oldPwd"
              label={$t('settings.security.oldPwd')}
              rules={rules.value.defaultPwd}
              validateTrigger="blur"
            >
              <Input
                v-model:modelValue={pwds.value.oldPwd}
                size="medium"
                placeholder={$t('settings.security.placeholder')}
              ></Input>
            </FormItem>

            <FormItem
              field="newPwd"
              label={$t('settings.security.newPwd')}
              rules={rules.value.customPwd}
              validateTrigger="blur"
            >
              <Input
                v-model:modelValue={pwds.value.newPwd}
                size="medium"
                placeholder={$t('settings.security.placeholder')}
              ></Input>
            </FormItem>

            <FormItem
              field="confirmPwd"
              label={$t('settings.security.confirmPwd')}
              rules={rules.value.customPwd}
              validateTrigger="blur"
            >
              <Input
                v-model:modelValue={pwds.value.confirmPwd}
                size="medium"
                placeholder={$t('settings.security.placeholder')}
              ></Input>
            </FormItem>

            <FormItem>
              <span class="security-setting-content-tip">{$t('settings.security.tip')}</span>
            </FormItem>

            <FormItem>
              <Space>
                <Button htmlType="submit" type="primary" status="normal" size="medium">
                  {$t('settings.security.button.submit')}
                </Button>
                <Button type="secondary" status="normal" size="medium" onClick={handleFormReset}>
                  {$t('settings.security.button.reset')}
                </Button>
              </Space>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
})
