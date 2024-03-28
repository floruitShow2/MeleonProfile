import { defineComponent, inject, toRefs, computed } from 'vue'
import type { PropType } from 'vue'
import { useBus } from '@/utils/common'
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

    const urlMap = body.value?.urlContentMap || {}
    const urlKeys = Object.keys(urlMap)
    const fragments = computed(() => {
      let content = body.value?.content || ''
      content = content.replace(/&nbsp;/g, '\u00A0')
      const regex = new RegExp(`(@\\S+\\s|${urlKeys.join('|')}|\\S+\\s)`, 'g')
      return content.split(regex)
    })

    // 针对回复消息的类型，提取对应的字段做展示
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

    const handleAtButtonClick = () => {
      alert('aaa')
    }

    return () => (
      <div class="text-body">
        {body.value?.replyId && (
          <div class="reply-content" onClick={handleReplyClick}>
            {generateReplyContent(body.value?.replyId)}
          </div>
        )}
        {/* <div>{body.value?.content}</div> */}
        <div>
          {fragments.value.map((item) => {
            if (item.startsWith('@') && item.trim() !== '' && item.trim() !== '@') {
              return <button onClick={handleAtButtonClick}>{item}</button>
            }
            return item
          })}
        </div>
      </div>
    )
  }
})
