import { getErrorEventDefinition, isErrorSupported } from '@/utils/event-definition-utils'
import { getStorage } from '@/components/Panel/common/utils'

export function errorStartEventRequired() {
  function check(nodeBo: BpmnModdleEl, reporter: Reporter) {
    if (!isErrorSupported(nodeBo)) return

    const errorRef = getErrorEventDefinition(nodeBo)?.errorRef

    if (!errorRef) {
      reporter.report(nodeBo.id, '请选择错误事件')
      return
    }

    const globalEvents = getStorage().globalEvents || {}

    if (!globalEvents.error?.[errorRef.id]) {
      reporter.report(nodeBo.id, '配置了未定义的错误事件')
    }
  }

  return { check }
}
