import { is } from 'bpmn-js/lib/util/ModelUtil'

export function callActivityProcessRequired() {
  function check(nodeBo: BpmnElement, reporter: Reporter) {
    if (!nodeBo || !is(nodeBo, 'bpmn:CallActivity')) return

    if (
      !nodeBo.get('calledElement') ||
      !nodeBo.get('calledElementType') ||
      !nodeBo.get('processInstanceName')
    ) {
      reporter.report(nodeBo.id, '请选择被调用的实例')
    }
  }

  return { check }
}
