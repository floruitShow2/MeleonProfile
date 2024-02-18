import { PropType, defineComponent, ref, toRefs } from 'vue'
import { Avatar, Input, Form, FormItem, Upload } from '@arco-design/web-vue'
import { IconEdit } from '@arco-design/web-vue/es/icon'
import type { FileItem, FormInstance } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    team: {
      type: Object as PropType<Partial<ApiTeam.TeamEntity>>,
      required: true,
      default: () => {}
    }
  },
  emits: ['update:team'],
  setup(props, { emit, expose }) {
    const { team } = toRefs(props)

    const formRef = ref<FormInstance>()

    // 上传logo
    const logoFile = ref<File | null>()
    const handleLogoUpload = (fileItems: FileItem[]) => {
      const lastFile = fileItems.at(-1)
      if (!lastFile) return
      const { url, file } = lastFile
      if (!file || !url) return
      logoFile.value = file
      emit('update:team', { ...team.value, logo: url })
    }

    const handleTeamChange = (val: Partial<ApiTeam.TeamEntity>) => {
      emit('update:team', { ...team.value, ...val })
    }

    expose({
      formRef,
      getLogoFile: () => logoFile.value ?? '',
      clearLogoFile: () => {
        logoFile.value = null
      }
    })

    return () => (
      <Form ref={formRef} model={team} layout="vertical">
        <FormItem field="logo" label="团队标志(可选)">
          <Avatar
            size={72}
            triggerType="mask"
            imageUrl={team.value.logo}
            v-slots={{
              'trigger-icon': () => (
                <Upload
                  accept="jpg,png,jpeg"
                  showFileList={false}
                  autoUpload={false}
                  v-slots={{
                    'upload-button': () => <IconEdit />
                  }}
                  onChange={handleLogoUpload}
                ></Upload>
              )
            }}
          ></Avatar>
        </FormItem>
        <FormItem
          field="teamName"
          label="团队名(必填)"
          rules={[{ required: true, message: '团队名不能为空' }]}
        >
          <Input
            modelValue={team.value.teamName}
            placeholder="请输入"
            onInput={(v: string) => handleTeamChange({ teamName: v })}
          />
        </FormItem>
        <FormItem field="introduction" label="团队介绍(可选)">
          <Input
            modelValue={team.value.introduction}
            placeholder="请输入"
            onInput={(v: string) => handleTeamChange({ introduction: v })}
          />
        </FormItem>
      </Form>
    )
  }
})
