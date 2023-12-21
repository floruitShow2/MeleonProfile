import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useBus, useAvatar } from '@/utils/global'
import { GetNotes } from '@/api/instrument/chat'
import { formatToDateTime } from '@/utils/format'
import { AccountStatus, SelfAccount } from '../../constant'
import './index.less'

export default defineComponent({
  setup() {
    const $bus = useBus()

    // _rooms
    const activeRoom = ref<ApiChat.RoomType | null>(null)
    $bus.on('onRoomChange', (room) => {
      activeRoom.value = room as ApiChat.RoomType
    })

    const accountStatus = reactive({
      key: 'offline',
      label: '离线'
    })
    const getStatus = () => {
      const keys = Object.keys(AccountStatus)
      const randomIdx = Math.floor(Math.random() * keys.length)
      return {
        key: keys[randomIdx],
        label: AccountStatus[keys[randomIdx]]
      }
    }
    const mockNotes = ref<ApiChat.NoteType[]>([])
    onMounted(async () => {
      const { data } = await GetNotes()
      if (!data) return
      mockNotes.value = data
      const { key, label } = getStatus()
      accountStatus.key = key
      accountStatus.label = label
    })
    return () => (
      <div class="ws-user-board">
        <div class="ws-user-board-self">
          <div class="avatar">
            <img src={useAvatar()} />
            <div class="overlay">
              <span class={[`is-${accountStatus.key}`]}>{accountStatus.label}</span>
            </div>
          </div>
          <span class="name">Meleon Cheng</span>
          <div class="tools">
            <i class="iconfont ws-call ibtn_base"></i>
            <i class="iconfont ws-chat ibtn_base"></i>
            <i class="iconfont ws-mail ibtn_base"></i>
            <i class="iconfont ws-more ibtn_base"></i>
          </div>
        </div>
        <ul class="ws-user-board-message">
          {SelfAccount.map((message) => (
            <li key={message.label}>
              <i class={['iconfont', message.icon]}></i>
              <span>{message.label}</span>
              <span>{message.value}</span>
            </li>
          ))}
        </ul>
        <div class="ws-user-board-notes">
          <div class="ws-user-board-notes-header">
            <span>Notes</span>
            <span>{mockNotes.value.length}</span>
          </div>
          <div class="ws-user-board-notes-content">
            {mockNotes.value.map((note) => (
              <li key={note.noteId}>
                <img src={useAvatar()} />
                <div class="message">
                  <div class="message-row">
                    <span class="message-row-name">{note.noteCreator}</span>
                    <span>{formatToDateTime(note.notePublishTime, 'M.DD HH:mmA')}</span>
                  </div>
                  <div class="message-row">
                    <p>
                      <span>@{note.noteReceiver}</span>
                      {note.noteContent}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
    )
  }
})
