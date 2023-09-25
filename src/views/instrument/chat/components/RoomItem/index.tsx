import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
// import useUserStore from '@/store/modules/user'
import { useAvatar } from '@/utils/global'
import { formatToDateTime } from '@/utils/format/time'
import { Dropdown, Doption } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ApiChat.RoomType>,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'pin'],
  setup(props, { emit }) {
    const { data, isActive } = toRefs(props)

    // const userStore = useUserStore()

    // const findAnotherOne = (arr: string[], self: string) => {
    //   return arr.find((user) => user !== self) || self
    // }

    const onRoomClick = (room: ApiChat.RoomType) => {
      emit('select', room.roomId)
    }

    const handleContextMenuSelect = (e: string | number | Record<string, any> | undefined) => {
      if (!e) return
      switch (e) {
        case 'pinned':
          emit('pin', data.value)
          break
        default:
          break
      }
    }

    return () => (
      <Dropdown
        trigger="contextMenu"
        alignPoint
        v-slots={{
          content: () => (
            <>
              <Doption value="pinned">{data.value.isPinned ? '取消置顶' : '置顶'}</Doption>
            </>
          )
        }}
        onSelect={handleContextMenuSelect}
      >
        <div
          class={['ws-room-item', isActive.value && 'is-active']}
          onClick={() => onRoomClick(data.value)}
        >
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
                  <span>{data.value.roomName}</span>
                  <span>
                    {formatToDateTime(
                      props.data.messageList.at(-1)?.commentPublishTime,
                      'MM-DD hh:mm'
                    )}
                  </span>
                </div>
                <div class="room-message">
                  <div class="room-message-last">
                    {props.data.messageList.at(-1)?.commentContent}
                  </div>
                  {data.value.unreadCount > 0 && (
                    <div class="room-message-new">{data.value.unreadCount}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Dropdown>
    )
  }
})
