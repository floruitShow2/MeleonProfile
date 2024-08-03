import { is } from 'bpmn-js/lib/util/ModelUtil'
import { getRoot } from '@/utils/element-utils'
import { flat } from '@miyue-mma/shared'

export function compensateBoundaryTaskRequired() {
  function check(nodeBo: BpmnElement, reporter: Reporter) {
    if (!is(nodeBo, 'bpmn:BoundaryEvent')) return

    const eventDef = nodeBo
      .get('eventDefinitions')
      ?.find((def: BpmnModdleEl) => def.$type === 'bpmn:CompensateEventDefinition')

    if (eventDef) {
      const rootElements = getRoot(nodeBo).rootElements || []

      const flowElements = flat(rootElements, { children: 'flowElements' })
      const artifacts = flowElements.reduce((arr: BpmnElement[], cur: BpmnRoot) => {
        arr.push(...(cur?.artifacts || []))
        return arr
      }, [])

      if (!artifacts.length || !artifacts.find((line: BpmnModdleEl) => line.sourceRef === nodeBo)) {
        reporter.report(nodeBo.id, '请设置补偿处理器')
      }
    }
  }

  return { check }
}
