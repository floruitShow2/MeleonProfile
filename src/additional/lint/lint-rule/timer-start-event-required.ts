import { getTimerEventDefinition, isTimerSupported } from '@/utils/event-definition-utils'

export function timerStartEventRequired() {
  function check(nodeBo: BpmnModdleEl, reporter: any) {
    if (!isTimerSupported(nodeBo)) return

    const eventDef = getTimerEventDefinition(nodeBo)
    if (
      !eventDef ||
      (!eventDef.timeDate?.body && !eventDef.timeCycle?.body && !eventDef.timeDuration?.body)
    ) {
      reporter.report(nodeBo.id, '请配置时间事件')
    }
  }

  return { check }
}
