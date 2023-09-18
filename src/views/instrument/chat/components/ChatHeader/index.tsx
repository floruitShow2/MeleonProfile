import { defineComponent, toRefs, computed } from 'vue'
import type { PropType } from 'vue'
import { useAppStore } from '@/store'
import './index.less'

export default defineComponent({
  props: {
    active: {
      type: Object as PropType<ApiChat.RoomType | null>,
      required: true
    }
  },
  emits: ['openDetail', 'openRooms'],
  setup(props, { emit }) {
    const { active } = toRefs(props)

    const appStore = useAppStore()
    const hideMenu = computed(() => appStore.hideMenu)

    return () => (
      <div class="ws-chat-header">
        {active.value && (
          <div class="ws-chat-header-message">
            <img src={active.value.roomAvatar} />
            <div class="chat-header-message_content">{active.value.roomName}</div>
          </div>
        )}
        {hideMenu.value && (
          <div class="ws-chat-header-tool">
            <i class="iconfont ws-group ibtn_base ibtn_hover" onClick={() => emit('openRooms')}></i>
            <i class="iconfont ws-menu ibtn_base ibtn_hover" onClick={() => emit('openDetail')}></i>
          </div>
        )}
      </div>
    )
  }
})
