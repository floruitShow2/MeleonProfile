import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import useUserStore from '@/store/modules/user'
import { useAvatar } from '@/utils/global'
import { formatToDateTime } from '@/utils/format/time'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ApiChat.RoomType>,
      required: true
    }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { data } = toRefs(props)

    const userStore = useUserStore()

    const findAnotherOne = (arr: string[], self: string) => {
      return arr.find((user) => user !== self) || self
    }

    const onRoomClick = (room: ApiChat.RoomType) => {
      emit('select', room.roomId)
    }

    return () => (
      <div class="ws-room-item" onClick={() => onRoomClick(props.data)}>
        {data.value && (
          <>
            <div class="img-list">
              {data.value.roomAvatar ? (
                <img src={data.value.roomAvatar} />
              ) : (
                props.data.relativeUserId
                  .slice(0, 9)
                  .map((user: string | number | symbol | undefined) => (
                    <img src={useAvatar()} key={user} />
                  ))
              )}
            </div>

            <div class="ws-room-item_content">
              <div class="room-detail">
                <span>{findAnotherOne(props.data.relativeUserId, userStore.getName)}</span>
                <span>
                  {formatToDateTime(
                    props.data.messageList.at(-1)?.commentPublishTime,
                    'MM-DD hh:mm'
                  )}
                </span>
              </div>
              <div class="room-message">
                <div class="room-message-last">{props.data.messageList.at(-1)?.commentContent}</div>
                {data.value.unreadCount > 0 && (
                  <div class="room-message-new">{data.value.unreadCount}</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
})
