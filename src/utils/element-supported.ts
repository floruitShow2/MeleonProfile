import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { getConditionalEventDefinition, isConditionalSource } from '@/helpers/condition-helpers'
import { getImplementationType } from '@/utils/implementation-type-utils'

/************************* 监听器 ************************/
export const LISTENER_ALLOWED_TYPES = [
  'bpmn:Activity',
  'bpmn:Event',
  'bpmn:Gateway',
  'bpmn:SequenceFlow',
  'bpmn:Process',
  'bpmn:Participant'
]
export const MULTIINSTANCE_ALLOWED_TYPES = [
  'bpmn:UserTask',
  'bpmn:ScriptTask',
  'bpmn:ServiceTask',
  'bpmn:WebServiceTask',
  'bpmn:BusinessRuleTask',
  'bpmn:EmailTask',
  'bpmn:ManualTask',
  'bpmn:SendTask',
  'bpmn:ReceiveTask',
  'bpmn:SubProcess',
  'bpmn:CallActivity'
]

export function isMultiinstanceSupported(element: BpmnElement) {
  if (isAny(element, MULTIINSTANCE_ALLOWED_TYPES)) {
    return !(is(element, 'bpmn:Participant') && !element.businessObject.processRef)
  }
  return false
}

export function isExecutionListenerSupported(element: BpmnElement) {
  if (isAny(element, LISTENER_ALLOWED_TYPES)) {
    return !(
      is(element, 'bpmn:Participant') &&
      is(element, 'bpmn:Collaboration') &&
      !element.businessObject.processRef
    )
  }
  return false
}

export function isUserTaskSupported(element: BpmnElement) {
  return is(element, 'bpmn:UserTask')
}

export function isScriptTaskSupported(element: BpmnElement) {
  return is(element, 'bpmn:ScriptTask')
}

export function isServiceTaskSupported(element: BpmnElement) {
  return is(element, 'bpmn:ServiceTask')
}

export function isDecisionTaskSupported(element: BpmnElement) {
  return is(element, 'bpmn:ServiceTask') && getImplementationType(element) === 'dmn'
}

export function isCallActivitySupported(element: BpmnElement) {
  return is(element, 'bpmn:CallActivity')
}

/************************* 顺序流 ************************/
export function isConditionalFlowSupported(element: BpmnElement): boolean {
  return is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)
}

/************************* 表单绑定 ************************/
export function isFormBindingSupported(element: BpmnElement): boolean {
  return (
    (is(element, 'bpmn:StartEvent') &&
      !is(element.parent, 'bpmn:SubProcess') &&
      isEmptyStartEvent(element)) ||
    is(element, 'bpmn:UserTask')
  )
}
export function isEmptyStartEvent(element: BpmnElement): boolean {
  return !element.businessObject.eventDefinitions || !element.businessObject.eventDefinitions.length
}
