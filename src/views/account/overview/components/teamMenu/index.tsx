import { defineComponent, onMounted, ref } from 'vue'
import { Button, Input, Table, TableColumn, Modal, Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { CreateTeam, FetchTeamList } from '@/api/team'
import TeamModal from './components/teamModal'
import MemberModal from './components/memberModal'
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

    // 团队创建相关
    const teamModalRef = ref()
    const showCreateModal = ref<boolean>(false)
    // 开启创建弹窗
    const handleOpenModal = async () => {
      showCreateModal.value = true
    }
    // 取消创建
    const handleCancel = () => {
      showCreateModal.value = false
    }
    const handleClose = () => {
      teamModalRef.value.formRef.resetFields()
      teamModalRef.value.clearLogoFile()
      teamEntity.value = {
        logo: '',
        teamName: '',
        introduction: ''
      }
    }
    // 确认创建
    const handleBeforeOk = async () => {
      const res = await teamModalRef.value.formRef.validate()
      if (res) return false
      const { teamName, introduction } = teamEntity.value
      const fd = new FormData()
      fd.append('file', teamModalRef.value.getLogoFile())
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

    const curTeam = ref<ApiTeam.TeamEntity>()
    const showMemberModal = ref<boolean>(false)
    const initMembersList = (teamId: string) => {
      console.log(teamId)
    }

    // 团队列表相关
    onMounted(async () => {
      await initTeamList()
    })
    // 查看团队详情
    const handleTeamDetail = async (team: ApiTeam.TeamEntity) => {
      try {
        await initMembersList(team.teamId)
        curTeam.value = team
        showMemberModal.value = true
      } catch (err) {
        console.log(err)
      }
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
    // 团队列表列配置
    const columnConfig: Array<{
      title: string
      align?: 'center' | 'left' | 'right'
      cell: ({ record }: { record: ApiTeam.TeamEntity }) => JSX.Element
    }> = [
      {
        title: '团队名',
        cell: ({ record }) => genTeamOrCreator(record.logo, record.teamName)
      },
      {
        title: '创建者',
        cell: ({ record }) =>
          genTeamOrCreator(record.creator?.avatar || '', record.creator?.username || '')
      },
      {
        title: '项目数',
        cell: ({ record }) => genCount(record.taskCount || 0, '个项目')
      },
      {
        title: '成员数',
        cell: ({ record }) => genCount(record.members?.length || 0, '名成员')
      },
      {
        title: '',
        align: 'center',
        cell: ({ record }) => (
          <Button type="text" onClick={() => handleTeamDetail(record)}>
            查看详情
          </Button>
        )
      }
    ]

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
                  {columnConfig.map((column) => (
                    <TableColumn
                      title={column.title}
                      align={column.align}
                      v-slots={{
                        cell: column.cell
                      }}
                    />
                  ))}
                </>
              )
            }}
          ></Table>
        </div>

        {/* 创建团队弹窗 */}
        <Modal
          v-model:visible={showCreateModal.value}
          title="创建团队"
          mask-closable={false}
          onCancel={handleCancel}
          onBeforeOk={handleBeforeOk}
          onClose={handleClose}
        >
          <TeamModal v-model:team={teamEntity.value} ref={teamModalRef} />
        </Modal>

        {/* 成员管理弹窗 */}
        <Modal
          title={curTeam.value?.teamName}
          v-model:visible={showMemberModal.value}
          mask-closable={false}
        >
          <MemberModal team={curTeam.value} />
        </Modal>
      </div>
    )
  }
})
