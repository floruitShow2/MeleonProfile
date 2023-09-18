import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import WsSearch from '@/components/search/index'
import WsRoomItem from '../RoomItem/index'
import './index.less'

export default defineComponent({
  props: {
    modelValue: String,
    rooms: {
      type: Array as PropType<ApiChat.RoomType[]>,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { rooms, modelValue } = toRefs(props)

    const updateActiveRoom = (roomId: string) => {
      emit('update:modelValue', roomId)
    }

    return () => (
      <div class="ws-room-list">
        <div class="ws-room-list_header">
          <span>群组列表</span>
          <div class="header-tools">
            <WsSearch id="chat-rooms" />
            <i class="iconfont ws-plus ibtn_base"></i>
          </div>
        </div>
        <div class="ws-room-list_content">
          {rooms.value.map((room) => {
            return (
              <WsRoomItem
                class={{
                  'is-active': room.roomId === modelValue.value
                }}
                key={room.roomId}
                data={room}
                onSelect={updateActiveRoom}
              />
            )
          })}
        </div>
        <div class="ws-room-list_footer"></div>
      </div>
    )
  }
})
