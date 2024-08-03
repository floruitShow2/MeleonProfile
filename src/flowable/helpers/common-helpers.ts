import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { sortBy } from 'min-dash'

export type ModdleElGetter = (el: BpmnElement, arg?: BpmnModdleEl) => BpmnModdleEl
export type FieldType = 'string' | 'expression'

export const EMPTY_OPTION = ''
export const CREATE_NEW_OPTION = 'create-new'

export function hasProcessRef(element): boolean {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef')
}

export function showProcessProperty(element: BpmnElement) {
  return is(element, 'bpmn:Process') || hasProcessRef(element)
}

export function getProcess(element: BpmnElement): BpmnModdleEl {
  return is(element, 'bpmn:Process')
    ? getBusinessObject(element)
    : getBusinessObject(element).get('processRef')
}

export function getExpressionBody(expression?: BpmnModdleEl): string {
  return (expression && expression.get('body')) || ''
}

export function isAsyncBefore(bo: BpmnModdleEl): boolean {
  return !!(bo.get(`flowable:asyncBefore`) || bo.get(`flowable:async`))
}
export function isAsyncAfter(bo: BpmnModdleEl): boolean {
  return !!bo.get(`flowable:asyncAfter`)
}
export function isAsync(bo: BpmnModdleEl): boolean {
  return isAsyncAfter(bo) || isAsyncBefore(bo)
}
export function isExclusive(bo: BpmnModdleEl): boolean {
  return !!bo.get(`flowable:exclusive`)
}

export function sortByName(elements: BpmnModdleEl[]) {
  return sortBy(elements, (e) => (e.name || '').toLowerCase())
}

export function getFieldType(field: BpmnModdleEl): FieldType {
  return (
    ('string' in field && 'string') ||
    ('expression' in field && 'expression') ||
    ('stringValue' in field && 'string') ||
    'string'
  )
}

export function getRelevantBusinessObject(element: BpmnElement | BpmnModdleEl): BpmnModdleEl {
  const businessObject = getBusinessObject(element)

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef')
  }

  return businessObject
}

const conditionalSources = ['bpmn:ExclusiveGateway']
export function isConditionalFlow(element: BpmnElement): boolean {
  return is(element, 'bpmn:SequenceFlow') && isAny(element.source, conditionalSources)
}
