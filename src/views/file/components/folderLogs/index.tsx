import { defineComponent, toRefs, ref } from 'vue'
import { FetchOperationLogs } from '@/api/file'
import WsLogItem from './item'
import './index.less'

export default defineComponent({
  props: {
    activeId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { activeId } = toRefs(props)

    const operationLogs = ref<ApiFile.OperationLogType[]>([])

    const getLogs = async (id: string) => {
      const { data } = await FetchOperationLogs(id)
      if (!data) return
      operationLogs.value = data
    }

    getLogs(activeId.value)

    return () => (
      <div class="ws-operate-logs">
        {operationLogs.value.map((log, index) => (
          <WsLogItem data={log} showLine={index !== operationLogs.value.length - 1} />
        ))}
      </div>
    )
  }
})
