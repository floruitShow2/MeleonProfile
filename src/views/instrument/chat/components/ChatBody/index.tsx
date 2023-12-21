import {
  defineComponent,
  ref,
  toRefs,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  provide,
  reactive
} from 'vue'
// import { GetComments } from '@/api/instrument/chat'
import useUserStore from '@/store/modules/user'
import { useBus, useAvatar } from '@/utils/global'
import { formatToDateTime } from '@/utils/format/time'
import { Spin } from '@arco-design/web-vue'
import RenderMessage from '../RenderMessage'
import { MockMessageList } from './constant'
import { messageInjectionKey } from './context'
import './index.less'

export default defineComponent({
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { roomId } = toRefs(props)

    const userStore = useUserStore()
    const $bus = useBus()

    const prefix = 'ws-chat-body'

    // const comments = ref<ApiChat.CommentType[]>([])
    const messageList = ref<ApiChat.MessageEntity[]>(MockMessageList)

    provide(
      messageInjectionKey,
      reactive({
        roomId: roomId.value,
        messageList: messageList.value
      })
    )
    // const getComments = async (roomid: string) => {
    //   const { data } = await GetComments(roomid)
    //   if (!data) return []
    //   return data
    // }
    // const getCommentsById = (id: string) => {
    //   const result = comments.value.find((item) => item.commentId === id)
    //   return result || ({} as ApiChat.CommentType)
    // }

    const markerId = ref<string | null>(null)
    const chatRef = ref<HTMLLIElement[]>([])
    const chatListRef = ref()
    const animateLoadComments = async (idx?: number) => {
      nextTick(() => {
        if (idx === -1) {
          const item = chatRef.value.at(idx) as HTMLLIElement | undefined
          if (!item) return
          item.animate(
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 800, easing: 'ease', fill: 'both' }
          )
        } else {
          const len = chatRef.value.length
          for (let i = len - 1; i >= 0; i--) {
            const item: HTMLLIElement = chatRef.value[i]
            item.animate(
              [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
              ],
              { duration: 800, delay: (len - 1 - i) * 200, easing: 'ease', fill: 'both' }
            )
          }
        }
      })
    }
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatListRef.value) chatListRef.value.scrollTo(0, chatListRef.value.scrollHeight)
      })
    }
    watch(roomId, async () => {
      // comments.value = await getComments(newVal)
      scrollToBottom()
    })

    const onReferenceClick = (referenceId: string) => {
      const item: HTMLElement = chatListRef.value.querySelector(`[comment-id="${referenceId}"]`)
      if (item) {
        item.scrollIntoView()
        markerId.value = referenceId
      }
    }

    onMounted(async () => {
      // 发布消息
      $bus.on('onCommentSubmit', async (message) => {
        messageList.value.push(message as ApiChat.MessageEntity)
        animateLoadComments(-1)
        scrollToBottom()
      })
      // 上传文件
      $bus.on('onCommentFileUploaded', (e) => {
        const { filename } = e as { filename: string }
        const len = messageList.value.length
        for (let i = len - 1; i >= 0; i--) {
          const { type, body } = messageList.value[i].message
          if (type === 'File' && 'filename' in body && body.filename === filename) {
            messageList.value[i].loading = false
            break
          }
        }
      })
      // 点击回复区域
      $bus.on('onReferenceClick', (e) => {
        onReferenceClick(e as string)
      })
    })
    const onReplyComment = (comment: ApiChat.MessageEntity) => {
      $bus.emit('onCommentReply', comment)
    }

    onBeforeUnmount(() => {
      $bus.all.clear()
    })

    const isDragging = ref<boolean>(false)
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (!isDragging.value) isDragging.value = true
    }
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (isDragging.value) isDragging.value = false
    }
    const handleFileDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragging.value = false
      const files = Array.from(e.dataTransfer?.files || [])
      console.log(files)
      // files.forEach((file) => {
      //   sendMsg<ApiChat.FileBody>('File', { filename: file.name, size: file.size, url: '' }, true)
      //   $bus.emit('onCommentFileUploaded', { filename: file.name })
      // })
    }

    return () => (
      <div
        class={prefix}
        onDragover={handleDragOver}
        onDragleave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <ul ref={chatListRef}>
          {/* <RenderMessage /> */}
          {messageList.value.map((item, idx) => (
            <li
              key={item.id}
              ref={(el) => {
                if (chatRef.value && el) chatRef.value[idx] = el as HTMLLIElement
              }}
              comment-id={item.id}
              class={{
                'is-self': userStore.getName === item.publisher,
                'is-marker': markerId.value === item.id
              }}
            >
              <img class="avatar" src={useAvatar()} />
              <div class="content">
                <div class="content-header">
                  <span>{item.publisher}</span>
                  <span>{formatToDateTime(item.publishTime, 'MM-DD hh:mm')}</span>
                </div>
                <div class="content-body">
                  <Spin loading={item.loading || false}>
                    <div class="content-body-message">
                      <RenderMessage message={item.message} />
                    </div>
                  </Spin>
                  <div class="content-body-tools">
                    <i class="iconfont ws-like"></i>
                    <i class="iconfont ws-reply" onClick={() => onReplyComment(item)}></i>
                    <i class="iconfont ws-menu"></i>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {isDragging.value && <div class={`${prefix}-mask`} />}
      </div>
    )
  }
})
