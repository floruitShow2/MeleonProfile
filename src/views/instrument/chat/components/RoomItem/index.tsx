import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import { useAvatar } from '@/utils/global'
import { formatToDateTime } from '@/utils/format/time'
import { Dropdown, Doption } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ChatRoom.RoomEntity>,
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

    const onRoomClick = (room: ChatRoom.RoomEntity) => {
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
              <div class="ws-room-item_cover">
                <img src={data.value.roomCover} />
              </div>

              <div class="ws-room-item_content">
                <div class="room-detail">
                  <span>{data.value.roomName}</span>
                  <span>
                    {formatToDateTime(props.data.messages.at(-1)?.publishTime, 'MM-DD hh:mm')}
                  </span>
                </div>
                <div class="room-message">
                  <div class="room-message-last">{props.data.messages.at(-1)?.message.content}</div>
                  {data.value.messages.length > 0 && (
                    <div class="room-message-new">{data.value.messages.length}</div>
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
