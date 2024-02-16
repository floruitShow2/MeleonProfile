import { defineComponent, onMounted, ref } from 'vue'
import {
  Avatar,
  Button,
  Input,
  Table,
  TableColumn,
  Modal,
  Form,
  FormItem,
  Message,
  Upload
} from '@arco-design/web-vue'
import type { FileItem, FormInstance } from '@arco-design/web-vue'
import { IconEdit, IconSearch } from '@arco-design/web-vue/es/icon'
import { CreateTeam, FetchTeamList } from '@/api/team'
import './index.less'

export default defineComponent({
  setup() {
    // 查询条件
    const searchQuery = ref<string>('')
    // 团队列表
    const teamList = ref<ApiTeam.TeamEntity[]>([])
    const initTeamList = async () => {
      const { data } = await FetchTeamList()
      if (!data) return
      teamList.value = data
    }

    // 创建团队表单
    const teamEntity = ref<Partial<ApiTeam.TeamEntity>>({
      logo: '',
      teamName: '',
      introduction: ''
    })
    const logoFile = ref<File | null>()
    const formRef = ref<FormInstance>()
    const showCreateModal = ref<boolean>(false)
    // 开启创建弹窗
    const handleOpenModal = async () => {
      showCreateModal.value = true
    }
    // 上传logo
    const handleLogoUpload = (fileItems: FileItem[]) => {
      const lastFile = fileItems.at(-1)
      if (!lastFile) return
      const { url, file } = lastFile
      if (!file || !url) return
      logoFile.value = file
      teamEntity.value.logo = url
    }
    // 取消创建
    const handleCancel = () => {
      showCreateModal.value = false
    }
    const handleClose = () => {
      formRef.value?.resetFields()
      teamEntity.value = {
        logo: '',
        teamName: '',
        introduction: ''
      }
      logoFile.value = null
    }
    // 确认创建
    const handleBeforeOk = async () => {
      const res = await formRef.value?.validate()
      if (res) return false
      const { teamName, introduction } = teamEntity.value
      const fd = new FormData()
      fd.append('file', logoFile.value ?? '')
      fd.append('teamName', teamName ?? '')
      fd.append('introduction', introduction ?? '')
      const { data } = await CreateTeam(fd)
      if (data) {
        Message.info({
          content: '任务新增成功'
        })
        await initTeamList()
      }

      showCreateModal.value = false
      return true
    }

    onMounted(async () => {
      await initTeamList()
    })

    const handleTeamDetail = (teamId: string) => {
      console.log(teamId)
    }

    // 生成表格中 团队名 及 创建者 单元格的内容
    const genTeamOrCreator = (avatar: string, name: string) => {
      return (
        <div class="column-cell">
          <div class="column-cell-avatar">
            <img src={avatar} alt="" />
          </div>
          <span>{name}</span>
        </div>
      )
    }

    // 生成表格中 项目数 及 成员数 单元格的内容
    const genCount = (count: number, label: string) => {
      return (
        <div class="column-cell">
          <span>{`${count} ${label}`}</span>
        </div>
      )
    }

    return () => (
      <div class="team-wrapper">
        <div class="team-wrapper-header">
          <h4>团队管理</h4>
          <Button type="primary" onClick={handleOpenModal}>
            创建团队
          </Button>
        </div>
        <div class="team-wrapper-list">
          {/* 过滤选项 */}
          <div class="team-wrapper-list--filter">
            <span>团队列表</span>
            <Input
              v-model:modelValue={searchQuery.value}
              placeholder="请输入"
              v-slots={{
                prefix: () => <IconSearch />
              }}
            />
          </div>
          {/* 团队列表 */}
          <Table
            class="team-wrapper-list--table"
            data={teamList.value}
            pagination={false}
            v-slots={{
              columns: () => (
                <>
                  <TableColumn
                    title="团队名"
                    v-slots={{
                      cell: ({ record }: { record: ApiTeam.TeamEntity }) =>
                        genTeamOrCreator(record.logo, record.teamName)
                    }}
                  />
                  <TableColumn
                    title="创建者"
                    v-slots={{
                      cell: ({ record }: { record: ApiTeam.TeamEntity }) =>
                        genTeamOrCreator(
                          record.creator?.avatar || '',
                          record.creator?.username || ''
                        )
                    }}
                  />
                  <TableColumn
                    title="项目数"
                    v-slots={{
                      cell: ({ record }: { record: ApiTeam.TeamEntity }) =>
                        genCount(record.taskCount || 0, '个项目')
                    }}
                  ></TableColumn>
                  <TableColumn
                    title="成员数"
                    v-slots={{
                      cell: ({ record }: { record: ApiTeam.TeamEntity }) =>
                        genCount(record.members?.length || 0, '名成员')
                    }}
                  />
                  <TableColumn
                    align="center"
                    v-slots={{
                      cell: ({ record }: { record: ApiTeam.TeamEntity }) => (
                        <Button type="text" onClick={() => handleTeamDetail(record.teamId)}>
                          查看详情
                        </Button>
                      )
                    }}
                  ></TableColumn>
                </>
              )
            }}
          ></Table>
        </div>

        <Modal
          v-model:visible={showCreateModal.value}
          title="Modal Form"
          mask-closable={false}
          onCancel={handleCancel}
          onBeforeOk={handleBeforeOk}
          onClose={handleClose}
        >
          <Form ref={formRef} model={teamEntity} layout="vertical">
            <FormItem field="logo" label="团队标志(可选)">
              <Avatar
                size={72}
                triggerType="mask"
                imageUrl={teamEntity.value.logo}
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
              <Input v-model:modelValue={teamEntity.value.teamName} placeholder="请输入" />
            </FormItem>
            <FormItem field="introduction" label="团队介绍(可选)">
              <Input v-model:modelValue={teamEntity.value.introduction} placeholder="请输入" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
})
