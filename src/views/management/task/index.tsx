import { defineComponent, onBeforeMount, ref } from 'vue'
import { FetchAllTasks } from '@/api/task'
import Draggable from 'vuedraggable'
import { Drawer, Select, Option, Dropdown, Doption, Message } from '@arco-design/web-vue'
import WsComments from '@/components/comments'
import WsTaskCard from './components/taskCard'
import WsTaskEditor from './components/taskEditor'
import type { HiddenFields } from './components/taskCard/interface'
import 'swiper/css'
import './index.less'

export default defineComponent({
  setup() {
    // task manage
    const mapContentFields = ref<Record<HiddenFields, string>>({
      keywords: '关键词',
      tool: '按钮',
      title: '标题',
      description: '描述',
      relatives: '相关人',
      reports: '周报数量'
    })
    const contentSet = ref<HiddenFields[]>([])
    const onContentSetSelect = (value: string | number | Record<string, any> | undefined) => {
      const selected = (value || '').toString() as HiddenFields
      const findIdx = contentSet.value.findIndex((field) => field === selected)
      if (findIdx !== -1) {
        contentSet.value.splice(findIdx, 1)
      } else {
        contentSet.value.push(selected)
      }
    }
    // tasks list
    const draggableOptions = {
      animation: 200,
      group: 'task'
    }

    const columns = ref<
      Array<{
        group: string
        list: ApiTask.TaskEntity[]
      }>
    >([
      {
        group: '要做的事',
        list: []
      },
      {
        group: '进展中',
        list: []
      },
      {
        group: '回顾中',
        list: []
      },
      {
        group: '排期中',
        list: []
      }
    ])

    const initTasks = async () => {
      const { data } = await FetchAllTasks()
      if (!data) return
      const obj: Record<string, ApiTask.TaskEntity[]> = {}
      data.forEach((item) => {
        obj[item.group] = item.list
      })
      columns.value = columns.value.map((item) => ({
        group: item.group,
        list: obj[item.group]
      }))
    }

    onBeforeMount(initTasks)

    const displayMode = ref<Record<string, string>[]>([
      {
        type: 'table',
        label: '表格视图',
        icon: 'ws-template'
      },
      {
        type: 'card',
        label: '卡片视图',
        icon: 'ws-node'
      }
    ])
    const activeMode = ref<'card' | 'table'>('card')

    const showEditDrawer = ref(false)
    const curGroup = ref<string>('')
    const handleCreate = (group: string) => {
      showEditDrawer.value = true
      curGroup.value = group
    }

    const editorRef = ref()
    const handleConfirm = async () => {
      const { data } = await editorRef.value.createTask()
      if (!data) {
        Message.error('任务创建失败')
        return false
      }
      showEditDrawer.value = false
      Message.success('任务创建成功')
      await initTasks()
      return false
    }

    // 点击卡片，编辑任务
    const handleCardClick = () => {
      console.log('a')
    }

    const showCommentsDrawer = ref<boolean>(false)
    const curTask = ref<ApiTask.TaskEntity | null>()
    const handleCommentClick = (task: ApiTask.TaskEntity) => {
      showCommentsDrawer.value = true
      curTask.value = task
    }

    const handleReply = () => {}

    return () => (
      <div class="ws-management-task">
        <div class="task-manage">
          <header class="task-manage-header">
            <div class="select-controller">
              <Select
                v-model:modelValue={activeMode.value}
                size="mini"
                v-slots={{
                  default: () =>
                    displayMode.value.map((mode) => (
                      <Option key={mode.type} value={mode.type} label={mode.label} />
                    )),
                  label: (scope: any) => (
                    <div class="arco-select-label">
                      <i
                        class={[
                          'iconfont',
                          `ws-${scope.data.value === 'table' ? 'template' : 'node'}`
                        ]}
                      ></i>
                      {scope.data.label}
                    </div>
                  )
                }}
              />
            </div>
            <Dropdown
              hide-on-select={false}
              v-slots={{
                default: () => (
                  <div class="controller">
                    <i class="iconfont ws-set" />
                    <span>内容配置</span>
                  </div>
                ),
                content: () =>
                  Object.keys(mapContentFields.value).map((field) => (
                    <Doption
                      value={field}
                      v-slots={{
                        default: () => mapContentFields.value[field as HiddenFields],
                        icon: () => (
                          <i
                            class={[
                              'iconfont',
                              contentSet.value.includes(field as HiddenFields)
                                ? 'ws-unview'
                                : 'ws-view'
                            ]}
                          />
                        )
                      }}
                    />
                  ))
              }}
              onSelect={onContentSetSelect}
            />
            <div class="controller">
              <i class="iconfont ws-filter" />
              <span>筛选</span>
            </div>
            <div class="controller">
              <i class="iconfont ws-sort" />
              <span>排序</span>
            </div>
            <div class="controller">
              <i class="iconfont ws-search" />
              <span>搜索</span>
            </div>
          </header>
          <section class="task-manage-content">
            {columns.value.map((column) => (
              <div key={column.group} class="column">
                <div class="column-header">
                  <p>{column.group}</p>
                  <div class="tools">
                    <i
                      class="iconfont ws-plus ibtn_base ibtn_hover"
                      onClick={() => handleCreate(column.group)}
                    ></i>
                    <i class="iconfont ws-more-vertical ibtn_base ibtn_hover"></i>
                  </div>
                </div>
                <Draggable
                  v-model={column.list}
                  // tag="transition-group"
                  itemKey={column.group}
                  componentData={{
                    class: 'column-content'
                  }}
                  ghost-class="ghost-card"
                  {...draggableOptions}
                  v-slots={{
                    item: ({ element }: { element: ApiTask.TaskEntity }) => {
                      return (
                        <WsTaskCard
                          key={element.taskId}
                          data={element}
                          onClick={handleCardClick}
                          onCommentClick={() => handleCommentClick(element)}
                        />
                      )
                    }
                  }}
                />
              </div>
            ))}
          </section>
        </div>
        {/* 任务编辑器弹窗 */}
        <Drawer
          v-model:visible={showEditDrawer.value}
          width={500}
          v-slots={{
            title: () => curGroup.value
          }}
          onBeforeOk={handleConfirm}
        >
          <WsTaskEditor ref={editorRef} group={curGroup.value} />
        </Drawer>
        {/* 任务留言弹窗 */}
        <Drawer
          v-model:visible={showCommentsDrawer.value}
          width={500}
          footer={false}
          unmountOnClose
          v-slots={{
            title: () => curTask.value?.title || ''
          }}
        >
          {curTask.value?.taskId && <WsComments target={curTask.value?.taskId} />}
        </Drawer>
      </div>
    )
  }
})
