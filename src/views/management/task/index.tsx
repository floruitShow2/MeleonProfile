import { defineComponent, onBeforeMount, ref, reactive } from 'vue'
import { FetchAllTasks, UpdateTask } from '@/api/task'
import Draggable from 'vuedraggable'
import { Drawer, Message, Tag, Table, TableColumn } from '@arco-design/web-vue'
import { TagColorMap, TypeColorMap } from '@/constants/tag'
import WsAvatar from '@/components/avatar'
import WsComments from '@/components/comments'
import WsAvatarGroup from '@/components/avatarGroup'
import WsTaskCard from './components/taskCard'
import WsTaskEditor from './components/taskEditor'
import HeaderWrapper from './components/HeaderWrapper'
import type { TaskConfigOptions } from './interface'
import 'swiper/css'
import './index.less'

export default defineComponent({
  setup() {
    // tasks list
    const draggableOptions = {
      animation: 200,
      group: 'task'
    }

    const configOptions = ref<TaskConfigOptions>({
      activeMode: 'card'
    })
    const onConfigOptionsChange = (val: TaskConfigOptions) => {
      configOptions.value = val
    }

    // 任务列表
    const groups = ref<
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

    const searchOptions = ref<ApiTask.SearchOptions>({
      title: '',
      tags: [],
      startDate: '',
      endDate: ''
    })

    const initTasks = async () => {
      const { data } = await FetchAllTasks(searchOptions.value)
      if (!data) return
      const obj: Record<string, ApiTask.TaskEntity[]> = {}
      data.forEach((item) => {
        obj[item.group] = item.list
      })
      groups.value = groups.value.map((item) => ({
        group: item.group,
        list: obj[item.group]
      }))
    }

    const handleTaskMove = async (event: any) => {
      const { draggedContext, relatedContext } = event
      const originalTask = draggedContext.element as ApiTask.TaskEntity
      const targetGroup = relatedContext.component.itemKey as string
      if (!originalTask.taskId) {
        Message.error({
          content: '任务ID缺失，更新失败'
        })
        return
      }
      await UpdateTask(originalTask.taskId, { group: targetGroup })
    }

    onBeforeMount(initTasks)

    const onSearchOptionsChange = async (val: ApiTask.SearchOptions) => {
      searchOptions.value = val
      await initTasks()
    }

    const curGroup = ref<string>('')

    // 是否展示编辑器窗口
    const showEditDrawer = ref(false)
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

    // 批量生成表格
    const tableColumnsSettings = reactive<
      Array<{
        label: string
        code: keyof ApiTask.TaskEntity
        width: number
        renderFunction?: (record: ApiTask.TaskEntity) => JSX.Element
      }>
    >([
      {
        label: '任务名',
        code: 'title',
        width: 150
      },
      {
        label: '任务描述',
        code: 'desc',
        width: 150
      },
      {
        label: '标签',
        code: 'tags',
        width: 150,
        renderFunction(record: ApiTask.TaskEntity) {
          return (
            <>
              {record.tags.map((tag) => (
                <Tag size="small" color={TagColorMap[tag.type]}>
                  <span style={{ backgroundColor: TypeColorMap[tag.type] }}></span>
                  <span>{tag.label}</span>
                </Tag>
              ))}
            </>
          )
        }
      },
      {
        label: '创建人',
        code: 'creator',
        width: 150
      },
      {
        label: '起始日期',
        code: 'startTime',
        width: 150
      },
      {
        label: '结束日期',
        code: 'endTime',
        width: 150
      },
      {
        label: '关联人',
        code: 'relatives',
        width: 150,
        renderFunction(record: ApiTask.TaskEntity) {
          return (
            <>
              <WsAvatarGroup maxCount={3}>
                {record.relatives.map((user) => (
                  <WsAvatar
                    imgUrl={(user as ApiAuth.UserInfo).avatar}
                    shape="circle"
                    size={28}
                    background="#FFFFFF"
                  ></WsAvatar>
                ))}
              </WsAvatarGroup>
            </>
          )
        }
      },
      {
        label: '评论',
        code: 'comments',
        width: 150,
        renderFunction(record) {
          return (
            <div class="count-item" onClick={() => handleCommentClick(record)}>
              <i class="iconfont ws-message"></i>
              <span>{record.comments}</span>
            </div>
          )
        }
      }
    ])
    const genTable = (column: { group: string; list: ApiTask.TaskEntity[] }) => {
      return (
        <>
          <div key={column.group} class="task-manage-table">
            <div class="task-manage-table--header">
              <span>{column.group}</span>
              <div class="tools">
                <i
                  class="iconfont ws-plus ibtn_base ibtn_hover"
                  onClick={() => handleCreate(column.group)}
                ></i>
                <i class="iconfont ws-more-vertical ibtn_base ibtn_hover"></i>
              </div>
            </div>
            <div class="task-manage-table--container">
              <Table
                data={column.list}
                v-slots={{
                  columns: () =>
                    tableColumnsSettings.map((columnItem) => (
                      <TableColumn
                        title={columnItem.label}
                        dataIndex={columnItem.code}
                        width={columnItem.width}
                        v-slots={{
                          cell: ({ record }: { record: ApiTask.TaskEntity }) => {
                            if (columnItem.renderFunction) {
                              return columnItem.renderFunction(record)
                            }
                            return record[columnItem.code]
                          }
                        }}
                      ></TableColumn>
                    ))
                }}
              ></Table>
            </div>
          </div>
        </>
      )
    }

    return () => (
      <div class="ws-management-task">
        <div class="task-manage">
          <HeaderWrapper
            onConfigChange={onConfigOptionsChange}
            onSearchChange={onSearchOptionsChange}
          />
          {configOptions.value.activeMode === 'card' ? (
            <section class="task-manage-content card-mode">
              {groups.value.map((column) => (
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
                    move={handleTaskMove}
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
          ) : (
            <section class="task-manage-content table-mode">
              {groups.value.map((column) => genTable(column))}
            </section>
          )}
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
          {curTask.value?.taskId && (
            <WsComments target={curTask.value?.taskId} onUpdate={initTasks} />
          )}
        </Drawer>
      </div>
    )
  }
})
