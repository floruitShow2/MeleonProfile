import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { getEventDefinition } from '@/utils/event-definition-utils'

export type SequenceFlowType = '' | 'default' | 'condition'

export const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
]

export function getConditionExpression(element: BpmnElement): BpmnModdleEl {
  const businessObject = getBusinessObject(element)

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression')
  } else if (getConditionalEventDefinition(businessObject)) {
    return getConditionalEventDefinition(businessObject).get('condition')
  }
}

export function isConditionalSource(element: BpmnElement) {
  return isAny(element, CONDITIONAL_SOURCES)
}
export function getConditionalEventDefinition(element: BpmnElement) {
  if (!is(element, 'bpmn:Event')) {
    return false
  }
  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition')
}
