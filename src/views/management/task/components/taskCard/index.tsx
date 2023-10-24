import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import WsAvatarGroup from '@/components/avatarGroup'
import WsAvatar from '@/components/avatar'
import './index.less'
import { divide } from 'lodash'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<TaskMangeUtil.TaskCard>,
      required: true
    }
  },
  setup(props) {
    const { data } = toRefs(props)

    return () => (
      <div class="ws-task-card">
        <div class="ws-task-card-header">
          <h4>{data.value.title}</h4>
        </div>
        <div class="ws-task-card-content">
          <div class="keyword-list">
            {data.value.keywords.map((k) => (
              <span class={['keyword', k]}>{k}</span>
            ))}
          </div>
          <p>{data.value.description}</p>
        </div>
        <div class="ws-task-card-footer">
          <div class="counts-container">
            <div class="count-item">
              <i class="iconfont ws-link"></i>
              <span>{data.value.reports}</span>
            </div>
            <div class="count-item">
              <i class="iconfont ws-chat"></i>
              <span>{data.value.reports}</span>
            </div>
          </div>
          <WsAvatarGroup maxCount={3}>
            {data.value.relatives.map((user: string) => (
              <WsAvatar size={28}>{user}</WsAvatar>
            ))}
          </WsAvatarGroup>
        </div>
      </div>
    )
  }
})
