import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import WsAvatarGroup from '@/components/avatarGroup'
import WsAvatar from '@/components/avatar'
import type { HiddenFields } from './interface'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<TaskMangeUtil.TaskCard>,
      required: true
    },
    hidden: {
      type: Array as PropType<HiddenFields[]>,
      default: () => []
    }
  },
  setup(props) {
    const { data, hidden } = toRefs(props)

    const isPartDisplay = (key: HiddenFields) => {
      return !hidden.value.includes(key)
    }

    return () => (
      <div class="ws-task-card">
        <div class="ws-task-card-header">
          <div class="keyword-list">
            {isPartDisplay('keywords') &&
              data.value.keywords.map((k) => <span class={['keyword', k]}>{k}</span>)}
          </div>
          <div class="tool">
            {isPartDisplay('tool') && (
              <i class="iconfont ws-more-vertical ibtn_base ibtn_hover ibtn_mini"></i>
            )}
          </div>
        </div>
        <div class="ws-task-card-content">
          <h4>{isPartDisplay('title') && data.value.title}</h4>
          <p>{isPartDisplay('description') && data.value.description}</p>
        </div>
        <div class="ws-task-card-footer">
          {isPartDisplay('relatives') && (
            <WsAvatarGroup maxCount={3}>
              {data.value.relatives.map((user: string) => (
                <WsAvatar size={28}>{user}</WsAvatar>
              ))}
            </WsAvatarGroup>
          )}
          {isPartDisplay('reports') && (
            <div class="report-count">
              <i class="iconfont ws-book"></i>
              <span>{data.value.reports}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
})
