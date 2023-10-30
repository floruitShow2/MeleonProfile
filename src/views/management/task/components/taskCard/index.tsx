import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import { Tag } from '@arco-design/web-vue'
import { TagColorMap, TypeColorMap } from '@/constants/tag'
import WsAvatarGroup from '@/components/avatarGroup'
import WsAvatar from '@/components/avatar'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ApiTask.TaskEntity>,
      required: true
    }
  },
  emits: ['click', 'attachClick', 'commentClick'],
  setup(props, { emit }) {
    const { data } = toRefs(props)
    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      emit('click', e)
    }

    const handleAttachmentClick = (e: MouseEvent, attachments: number) => {
      if (attachments === 0) return
      e.stopPropagation()
      emit('attachClick')
    }
    const handleCommentClick = (e: MouseEvent) => {
      // if (comments === 0) return
      e.stopPropagation()
      emit('commentClick')
    }

    return () => (
      <div class="ws-task-card" onClick={handleClick}>
        {data.value.coverImage && (
          <div class="ws-task-card-cover">
            <img src={data.value.coverImage} alt="" />
          </div>
        )}
        <div class="ws-task-card-header">
          <h4>{data.value.title}</h4>
        </div>
        <div class="ws-task-card-content">
          <div class="tags">
            {data.value.tags.map((tag) => (
              <Tag size="small" color={TagColorMap[tag.type]}>
                <span style={{ backgroundColor: TypeColorMap[tag.type] }}></span>
                <span>{tag.label}</span>
              </Tag>
            ))}
          </div>
          {data.value.desc && <p>{data.value.desc}</p>}
        </div>
        <div class="ws-task-card-footer">
          <div class="counts-container">
            <div
              class="count-item"
              onClick={(e) => handleAttachmentClick(e, data.value.attachments?.length ?? 0)}
            >
              <i class="iconfont ws-link"></i>
              <span>{data.value.attachments?.length}</span>
            </div>
            <div class="count-item" onClick={handleCommentClick}>
              <i class="iconfont ws-message"></i>
              <span>{(data.value.comments || []).length}</span>
            </div>
          </div>
          <WsAvatarGroup maxCount={3}>
            {data.value.relatives.map((user) => (
              <WsAvatar
                imgUrl={(user as ApiAuth.UserInfo).avatar}
                shape="circle"
                size={28}
                background="#FFFFFF"
              ></WsAvatar>
            ))}
          </WsAvatarGroup>
        </div>
      </div>
    )
  }
})
