import { is, isAny } from 'bpmn-js/lib/util/ModelUtil'

// const conditionalSources = ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway', 'bpmn:ComplexGateway']
const conditionalSources = ['bpmn:ExclusiveGateway']

export function sequenceFlowConditionRequired() {
  function check(nodeBo: BpmnModdleEl, reporter: Reporter) {
    if (
      !is(nodeBo, 'bpmn:SequenceFlow') ||
      !nodeBo.sourceRef ||
      !isAny(nodeBo.sourceRef, conditionalSources)
    )
      return

    if (nodeBo.sourceRef.default !== nodeBo && !nodeBo.get('conditionExpression')?.get('body')) {
      reporter.report(nodeBo.id, '请配置条件')
    }
  }

  return {
    check
  }
}
