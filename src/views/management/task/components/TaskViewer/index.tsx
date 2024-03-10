import { PropType, defineComponent, toRefs } from 'vue'
import { Button } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    task: {
      type: Object as PropType<ApiTask.TaskEntity>,
      required: true
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
      console.log(`delete the task whose title is ${task.value.title}`)
      emit('delete')
    }

    return () => (
      <div class="task-viewer">
        {task.value.group}
        <Button onClick={handlePrevTask}>上一个</Button>
        <Button onClick={handleNextTask}>下一个</Button>
        <Button onClick={handleDelete}>删除</Button>
      </div>
    )
  }
})
