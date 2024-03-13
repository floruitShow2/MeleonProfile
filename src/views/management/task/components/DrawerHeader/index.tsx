import { PropType, defineComponent, toRefs } from 'vue'
import { Tooltip } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    task: {
      type: Object as PropType<ApiTask.TaskEntity>,
      default: () => ({})
    }
  },
  emits: ['prev', 'next', 'delete'],
  setup(props, { emit }) {
    const { task } = toRefs(props)

    const handlePrevTask = () => {
      emit('prev', { id: task.value.taskId, group: task.value.group })
    }
    const handleNextTask = () => {
      emit('next', { id: task.value.taskId, group: task.value.group })
    }
    const handleDelete = () => {
      const { taskId } = task.value
      if (!taskId) return
      console.log(`delete the task whose title is ${task.value.title}`)
      emit('delete')
    }

    return () => (
      <div class="ws-editor-header">
        <h4>{task.value.group}</h4>
        <div class="ws-editor-header-tools">
          <Tooltip content="上一条" position="bottom">
            <i class="iconfont ws-arrow-up ibtn_base ibtn_hover" onClick={handlePrevTask} />
          </Tooltip>
          <Tooltip content="下一条" position="bottom">
            <i class="iconfont ws-arrow-down ibtn_base ibtn_hover" onClick={handleNextTask} />
          </Tooltip>
          <div class="split-line" />
          <Tooltip content="移除当前记录" position="bottom">
            <i
              class={[
                'iconfont ws-delete ibtn_base ibtn_hover',
                task.value.taskId ? '' : 'ibtn_disabled'
              ]}
              onClick={handleDelete}
            ></i>
          </Tooltip>
          <div class="split-line" />
          <Tooltip content="关闭弹窗" position="bottom">
            <i class="iconfont ws-fold ibtn_base ibtn_hover"></i>
          </Tooltip>
          {/* <Button onClick={handlePrevTask}>上一个</Button>
          <Button onClick={handleNextTask}>下一个</Button>
          <Button onClick={handleDelete}>删除</Button> */}
        </div>
      </div>
    )
  }
})
