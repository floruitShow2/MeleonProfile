import { defineComponent, ref, onMounted } from 'vue'
import useUserStore from '@/store/modules/user'
import { useBus } from '@/utils/global'
import { formatToDateTime } from '@/utils/format'
import WsLargeFile from '@/components/largeFile'
import WsChatInput from '@/components/chatInput/index'
import type { IMention } from '@/components/chatInput/type'
import './index.less'

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    const $bus = useBus()

    const inputRef = ref()
    const focusInput = () => {
      if (inputRef.value) inputRef.value.focusEditor()
    }

    const isPopoverShow = ref(false)
    const popupContentType = ref<'Text' | 'Reply' | 'File'>('Text')

    // const isReferenceShow = ref(false)
    const referenceContent = ref<Partial<ApiChat.MessageEntity>>({})
    onMounted(() => {
      $bus.on('onCommentReply', (comment) => {
        isPopoverShow.value = true
        popupContentType.value = 'Reply'
        referenceContent.value = comment as ApiChat.MessageEntity
        focusInput()
        // if (inputRef.value) inputRef.value.focus()
      })
    })

    const inputMsg = ref('')
    const mentionList = ref<IMention[]>([])
    const onInputChange = (val: string, mentions: IMention[]) => {
      inputMsg.value = val
      mentionList.value = mentions
    }

    function sendMsg<T>(type: ApiChat.MsgEnum, body: T, isLoading = false) {
      const commentMessage: ApiChat.MessageEntity = {
        id: Math.random().toFixed(10),
        publisher: userStore.username || '',
        publishTime: formatToDateTime(new Date()),
        message: {
          type,
          body
        },
        loading: isLoading
      }
      $bus.emit('onCommentSubmit', commentMessage)
    }
    // 文本类型消息
    const cancelReply = () => {
      isPopoverShow.value = false
      referenceContent.value = {}
      focusInput()
    }

    const handleSubmitComment = (e: MouseEvent) => {
      if (!inputMsg.value) return
      e.stopPropagation()
      sendMsg<ApiChat.TextBody>('Text', {
        content: inputMsg.value,
        replyId: referenceContent.value.id
      })
      inputMsg.value = ''
      cancelReply()
    }

    // 文件类型消息
    const handleFileChange = (files: File[]) => {
      files.forEach((file) => {
        sendMsg<ApiChat.FileBody>('File', { filename: file.name, size: file.size, url: '' }, true)
      })
    }
    const onFileUploaded = (e: { file: File; fileList: File[] }) => {
      const { file } = e
      $bus.emit('onCommentFileUploaded', { filename: file.name })
    }

    const generatePopoverContent = () => {
      const { message } = referenceContent.value
      if (!message) return <></>
      const { type, body } = message
      let displayText = ''
      switch (type) {
        case 'Text':
          displayText = (body as ApiChat.TextBody).content
          break
        case 'File':
          displayText = (body as ApiChat.FileBody).filename
          break
        case 'Image':
          displayText = (body as ApiChat.ImageBody).url
          break
        default:
          break
      }
      if (popupContentType.value === 'Reply') {
        return (
          <div class="popover-reference">
            <span>@{referenceContent.value.publisher}</span>
            <span>回复到：{displayText}</span>
            {/* 取消回复 */}
            <i class="iconfont ws-close" onClick={cancelReply}></i>
          </div>
        )
      }
      return <></>
    }

    return () => (
      <div class="ws-chat-comment">
        <div class="ws-chat-comment_prefix">
          <i class="iconfont ws-audio"></i>
        </div>
        <WsChatInput
          ref={inputRef}
          v-model:modelValue={inputMsg.value}
          disabled={false}
          mentions={mentionList.value}
          onChange={onInputChange}
        />
        <div class="ws-chat-comment_suffix">
          <WsLargeFile autoUpload onChange={handleFileChange} onSuccess={onFileUploaded}>
            <i class="iconfont ws-folder" />
          </WsLargeFile>
          <i class="iconfont ws-navigator" onClick={handleSubmitComment}></i>
        </div>
        {isPopoverShow.value && (
          <div class="ws-chat-comment_popover">{generatePopoverContent()}</div>
        )}
      </div>
    )
  }
})
