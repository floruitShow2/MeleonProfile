import { defineComponent, toRefs, computed } from 'vue'
import type { PropType } from 'vue'
import WsSearch, {
  ConvertToRestrictList,
  ConvertToSearchFuzzyList
} from '@/components/search/index'
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
  emits: ['update:modelValue', 'roomPinned'],
  setup(props, { emit }) {
    const { rooms, modelValue } = toRefs(props)

    const updateActiveRoom = (roomId: string) => {
      emit('update:modelValue', roomId)
    }
    const pinCurrentRoom = (room: ApiChat.RoomType) => {
      emit('roomPinned', room.roomId)
    }

    const pinnedRooms = computed(() => {
      return rooms.value.filter((room) => room.isPinned)
    })

    const unpinnedRooms = computed(() => {
      return rooms.value.filter((room) => !room.isPinned)
    })

    const handleFetchFuzzyList = (query: string) => {
      if (!query.length) {
        return {
          hits: [],
          nbHits: 0
        }
      }

      return ConvertToSearchFuzzyList(
        ConvertToRestrictList(rooms.value, { roomId: 'id', roomName: 'label' }),
        query
      )
    }
    const handleRoomSelect = (e: { id: string }) => {
      updateActiveRoom(e.id)
    }

    return () => (
      <div class="ws-room-list">
        <div class="ws-room-list_header">
          <span>群组列表</span>
          <div class="header-tools">
            <WsSearch
              id="chat-rooms"
              fetchFuzzyList={handleFetchFuzzyList}
              onSelect={handleRoomSelect}
            />
            <i class="iconfont ws-plus ibtn_base ibtn_mini"></i>
          </div>
        </div>
        <div class="ws-room-list_content">
          <div class="group-title">
            <i class="iconfont ws-nail"></i>
            <span>PINNED</span>
          </div>
          {pinnedRooms.value.map((room) => {
            return (
              <WsRoomItem
                key={room.roomId}
                data={room}
                isActive={room.roomId === modelValue.value}
                onSelect={updateActiveRoom}
                onPin={pinCurrentRoom}
              />
            )
          })}
          <div class="group-title">
            <i class="iconfont ws-chat"></i>
            <span>ALL MESSAGE</span>
          </div>
          {unpinnedRooms.value.map((room) => {
            return (
              <WsRoomItem
                key={room.roomId}
                data={room}
                isActive={room.roomId === modelValue.value}
                onSelect={updateActiveRoom}
                onPin={pinCurrentRoom}
              />
            )
          })}
        </div>
        <div class="ws-room-list_footer"></div>
      </div>
    )
  }
})
