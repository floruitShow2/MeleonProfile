import { getMessage, isMessageSupported } from '@/utils/event-definition-utils'
import { getStorage } from '@/components/Panel/common/utils'

export function messageStartEventRequired() {
  function check(nodeBo: BpmnModdleEl, reporter: any) {
    if (!isMessageSupported(nodeBo)) return

    const messageRef = getMessage(nodeBo)
    if (!messageRef) {
      reporter.report(nodeBo.id, '请选择消息事件')
      return
    }

    const globalEvents = getStorage().globalEvents || {}

    if (!globalEvents.message?.[messageRef.id]) {
      reporter.report(nodeBo.id, '配置了未定义的消息事件')
    }
  }

  return { check }
}
