import { getSignal, isSignalSupported } from '@/utils/event-definition-utils'
import { getStorage } from '@/components/Panel/common/utils'

export function signalStartEventRequired() {
  function check(nodeBo: BpmnModdleEl, reporter: any) {
    if (!isSignalSupported(nodeBo)) return

    const signalRef = getSignal(nodeBo)
    if (!signalRef) {
      reporter.report(nodeBo.id, '请配置信号事件')
      return
    }

    const globalEvents = getStorage().globalEvents || {}

    if (!globalEvents.signal?.[signalRef.id]) {
      reporter.report(nodeBo.id, '配置了未定义的信号事件')
    }
  }

  return { check }
}
