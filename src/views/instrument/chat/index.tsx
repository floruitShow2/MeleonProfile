import { defineComponent, onBeforeMount, ref, computed, watch } from 'vue'
import { FetchRooms } from '@/api/chat'
import { useAppStore } from '@/store'
import { Drawer } from '@arco-design/web-vue'
import { WsRoomList, WsChatHeader, WsChatBody, WsChatComment, WsUserBoard } from './components'
import './index.less'

export default defineComponent({
  setup() {
    const appStore = useAppStore()
    const hideMenu = computed(() => appStore.hideMenu)
    // _rooms
    const rooms = ref<ChatRoom.RoomEntity[]>([])
    const activeRoomId = ref<string>('')

    const updateRooms = async () => {
      const { data } = await FetchRooms()
      if (!data) return
      rooms.value = data
      activeRoomId.value = data[0].roomId
    }

    const getRoomById = (id: string): ChatRoom.RoomEntity | null => {
      const findRoom = rooms.value.find((room) => room.roomId === id)
      return findRoom || null
    }

    const handleRoomPinned = (roomId: string) => {
      const findIdx = rooms.value.findIndex((room) => room.roomId === roomId)
      if (findIdx !== -1) {
        const findRoom = rooms.value[findIdx]
        rooms.value.splice(findIdx, 1, { ...findRoom, isPinned: !findRoom.isPinned })
      }
    }

    onBeforeMount(updateRooms)

    const rooomsVisible = ref<boolean>(false)
    const boardVisible = ref<boolean>(false)

    return () => (
      <div class="ws-contact">
        {!hideMenu.value ? (
          <div class="ws-contact-module ws-contact-left">
            <WsRoomList
              v-model:modelValue={activeRoomId.value}
              rooms={rooms.value}
              onRoomPinned={handleRoomPinned}
            />
          </div>
        ) : (
          <Drawer
            visible={rooomsVisible.value}
            width={430}
            placement="left"
            header={false}
            footer={false}
            maskClosable
            onCancel={() => {
              rooomsVisible.value = false
            }}
          >
            <div class="ws-contact-module ws-contact-left">
              <WsRoomList
                v-model:modelValue={activeRoomId.value}
                rooms={rooms.value}
                onRoomPinned={handleRoomPinned}
              />
            </div>
          </Drawer>
        )}
        <div class="ws-contact-module ws-contact-main">
          <WsChatHeader
            class="ws-chat-header"
            active={getRoomById(activeRoomId.value)}
            onOpenRooms={() => {
              rooomsVisible.value = true
            }}
            onOpenDetail={() => {
              boardVisible.value = true
            }}
          />
          <WsChatBody class="ws-chat-body" roomId={activeRoomId.value} />
          <WsChatComment class="ws-chat-input" />
        </div>
        {!hideMenu.value ? (
          <div class="ws-contact-module ws-contact-aside">
            <WsUserBoard />
          </div>
        ) : (
          <Drawer
            visible={boardVisible.value}
            width={430}
            placement="right"
            header={false}
            footer={false}
            maskClosable
            onCancel={() => {
              boardVisible.value = false
            }}
          >
            <div class="ws-contact-module ws-contact-aside">
              <WsUserBoard />
            </div>
          </Drawer>
        )}
      </div>
    )
  }
})
