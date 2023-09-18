import { defineComponent, inject, toRefs } from 'vue'
import type { PropType } from 'vue'
import { useBus } from '@/utils/global'
import { messageInjectionKey } from '../../ChatBody/context'
import './index.less'

export default defineComponent({
  props: {
    body: {
      type: Object as PropType<ApiChat.TextBody>,
      requried: true
    }
  },
  setup(props) {
    const { body } = toRefs(props)

    const messageCtx = inject(messageInjectionKey)

    const $bus = useBus()

    const messages = messageCtx ? messageCtx.messageList : []
    const generateReplyContent = (id: string) => {
      const findIdx = messages.findIndex((message) => message.id === id)
      if (findIdx === -1) return ''
      const { publisher, message } = messages[findIdx]
      let content = ''
      switch (message.type) {
        case 'Text':
          content = (message.body as ApiChat.TextBody).content
          break
        case 'File':
          content = (message.body as ApiChat.FileBody).filename
          break
        case 'Image':
          content = (message.body as ApiChat.ImageBody).url
          break
        default:
          break
      }

      return (
        <>
          <p>
            <span>{`@${publisher}`}</span>
            {content}
          </p>
        </>
      )
    }

    const handleReplyClick = () => {
      const id = body.value?.replyId || ''
      if (id) $bus.emit('onReferenceClick', id)
    }

    return () => (
      <div class="text-body">
        {body.value?.replyId && (
          <div class="reply-content" onClick={handleReplyClick}>
            {generateReplyContent(body.value?.replyId)}
          </div>
        )}
        <div>{body.value?.content}</div>
      </div>
    )
  }
})
