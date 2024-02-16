import { computed, defineComponent, onMounted, ref } from 'vue'
import {
  Skeleton,
  SkeletonLine,
  SkeletonShape,
  Space,
  Avatar,
  Input,
  Textarea,
  Button,
  Message,
  Upload,
  Cascader
} from '@arco-design/web-vue'
import type { FileItem } from '@arco-design/web-vue'
import { IconEdit, IconLink } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import { getUserInfo, updateUserAvatar, updateUserInfo } from '@/api/auth'
import { genCascaderOptions } from '@/constants/scope'
import useLocale from '@/hooks/locale'
import { localStg } from '@/utils/storage'
import './index.less'

export default defineComponent({
  setup() {
    const { t: $t } = useI18n()
    const { currentLocale } = useLocale()

    const inpuPlaceholder = computed(() => {
      switch (currentLocale.value) {
        case 'zh-CN':
          return '请输入'
        case 'en-US':
          return 'please input'
        default:
          return '请输入'
      }
    })

    const userStore = useUserStore()

    const userInfo = ref<ApiAuth.UserInfo>()

    const initUserInfo = async () => {
      const { data } = await getUserInfo()
      if (!data) return
      userInfo.value = data
      userStore.setInfo(data)
    }

    onMounted(async () => {
      await initUserInfo()
    })

    const handleUserInfoUpdate = async () => {
      if (!userInfo.value) return
      const { data } = await updateUserInfo(userInfo.value)
      if (data) {
        localStg.set('token', data.accessToken)
        await initUserInfo()
        Message.info({
          content: '个人信息更新成功'
        })
      }
    }

    const handleAvatarUpload = async (fileItems: FileItem[]) => {
      if (!fileItems.length) return

      const { file } = fileItems[fileItems.length - 1]
      if (!file) return

      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await updateUserAvatar(fd)
      if (data) {
        await initUserInfo()
        Message.info({
          content: '更换头像成功'
        })
      }
    }

    const genSkeleton = (): JSX.Element => {
      return (
        <Skeleton>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <SkeletonLine widths={[80]} />
            <SkeletonShape shape="circle" />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={3} widths={[80, 300, 300]} />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={2} widths={[80, 300]} />

            <SkeletonLine rows={5} widths={[80, 300, 300, 300, 300]} />
          </Space>
        </Skeleton>
      )
    }

    const genSettings = (info: ApiAuth.UserInfo): JSX.Element => {
      if (!info) return <></>
      return (
        <div class="setting-list">
          <h4 class="setting-list-title">{$t('settings.basic.title')}</h4>
          {/* 头像 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.avatar')}</span>
            <Avatar
              size={72}
              triggerType="mask"
              v-slots={{
                default: () => (
                  <>
                    <img src={info.avatar} alt="" />
                  </>
                ),
                'trigger-icon': () => (
                  <Upload
                    accept="jpg,png,jpeg"
                    showFileList={false}
                    autoUpload={false}
                    v-slots={{
                      'upload-button': () => <IconEdit />
                    }}
                    onChange={handleAvatarUpload}
                  ></Upload>
                )
              }}
            ></Avatar>
          </div>
          {/* 用户名 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.username')}</span>
            <Input
              v-model:modelValue={info.username}
              placeholder={inpuPlaceholder.value}
              size="medium"
              allowClear
            />
          </div>
          {/* 手机号 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.phone')}</span>
            <Input
              v-model:modelValue={info.phone}
              placeholder={inpuPlaceholder.value}
              size="medium"
              allowClear
            />
          </div>
          {/* 邮箱 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.email')}</span>
            <Input
              v-model:modelValue={info.email}
              placeholder={inpuPlaceholder.value}
              size="medium"
              allowClear
            />
          </div>
          {/* 个人简介 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.introduction')}</span>
            <Textarea
              v-model:modelValue={info.introduction}
              placeholder={inpuPlaceholder.value}
              maxLength={200}
              allowClear
              autoSize={{
                minRows: 4,
                maxRows: 10
              }}
              showWordLimit
            />
          </div>
          {/* 籍贯/居住地 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.location')}</span>
            <Cascader
              v-model:modelValue={info.location}
              options={genCascaderOptions()}
              placeholder={inpuPlaceholder.value}
            />
          </div>
          {/* 职业 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.job')}</span>
            <Input
              v-model:modelValue={info.job}
              placeholder={inpuPlaceholder.value}
              size="medium"
              allowClear
            />
          </div>
          {/* 就职企业 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.organization')}</span>
            <Input
              v-model:modelValue={info.organization}
              placeholder={inpuPlaceholder.value}
              size="medium"
              allowClear
            />
          </div>
          {/* 社交网站 */}
          <div class="setting-list-item">
            <span class="label">{$t('settings.basic.socialAccounts')}</span>
            {new Array(4).fill(0).map((num, index) => (
              <Input
                v-model:modelValue={info.socialAccounts[index]}
                placeholder={inpuPlaceholder.value}
                size="medium"
                allowClear
                v-slots={{
                  prefix: () => <IconLink />
                }}
                style={{
                  marginBottom: '10px'
                }}
              />
            ))}
          </div>
          <div class="setting-list-item">
            <Button type="primary" status="normal" onClick={handleUserInfoUpdate}>
              {$t('settings.basic.updateButton')}
            </Button>
          </div>
        </div>
      )
    }

    return () => (
      <div class="basic-setting">
        {userInfo.value ? genSettings(userInfo.value) : genSkeleton()}
      </div>
    )
  }
})
