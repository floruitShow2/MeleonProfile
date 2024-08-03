import { SCRIPT_PROPS } from '@/helpers/script-helpers'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { getImplementationType, ImplementationType } from '@/utils/implementation-type-utils'
import { createElement, createExElement } from '@/utils/element-utils'
import type Modeler from 'bpmn-js/lib/Modeler'
import type { FieldType } from '@/helpers/common-helpers'

export type ListenerImplementationType = 'class' | 'expression' | 'delegateExpression' | 'script'
export type ListenerEventType =
  | 'Start'
  | 'End'
  | 'Take'
  | 'Create'
  | 'Assignment'
  | 'Complete'
  | 'Delete'
  | 'Update'
  | 'Timeout'

export type Field = {
  fieldName?: string
  fieldType?: FieldType
  fieldValue?: string
}

export type Listener = {
  event?: string
  listenerType?: ImplementationType
  listenerContent?: string
  fields: Field[]
}

export type BpmnField = BpmnModdleEl & {
  name?: string
  expression?: string
  string?: string
}

export type BpmnListener = BpmnModdleEl & {
  event?: string
  class?: string
  expression?: string
  delegateExpression?: string
  fields?: BpmnField[]
}

export const CLASS_PROPS = {
  class: undefined
}

export const EXPRESSION_PROPS = {
  expression: undefined
}

export const DELEGATE_EXPRESSION_PROPS = {
  delegateExpression: undefined
}

export const DEFAULT_PROPS = {
  ...SCRIPT_PROPS,
  ...CLASS_PROPS,
  ...EXPRESSION_PROPS,
  ...DELEGATE_EXPRESSION_PROPS
}

export const DEFAULT_EVENT_PROPS = {
  eventDefinitions: undefined,
  event: undefined
}

export const EVENT_TO_LABEL = {
  start: 'Start',
  end: 'End',
  take: 'Take',
  create: 'Create',
  assignment: 'Assignment',
  complete: 'Complete',
  delete: 'Delete',
  update: 'Update',
  timeout: 'Timeout'
}

export function getListenerEventTypeOptions(
  type: 'TaskListener' | 'ExecutionListener' | 'SequenceFlow'
): PropertyOptions {
  if (type === 'TaskListener') {
    return [
      { value: 'create', name: 'Create' },
      { value: 'assignment', name: 'Assignment' },
      { value: 'complete', name: 'Complete' },
      { value: 'delete', name: 'Delete' }
      // { value: 'update', name: 'Update' },
      // { value: 'timeout', name: 'Timeout' }
    ]
  }

  // if (type === 'SequenceFlow') {
  //   return [{ value: 'take', name: 'Take' }]
  // }

  // flowable 默认所有节点都能使用 Take
  return [
    { value: 'start', name: 'Start' },
    { value: 'take', name: 'Take' },
    { value: 'end', name: 'End' }
  ]
}
export function getListenerTypeOptions(): PropertyOptions {
  return [
    { value: 'class', name: 'JavaClass' },
    { value: 'expression', name: 'Expression' },
    { value: 'delegateExpression', name: 'DelegateExpression' }
    // { value: 'script', name: 'Script' }
  ]
}

export function getListenerType(element: BpmnElement | BpmnModdleEl) {
  return getImplementationType(element)
}

export function getDefaultEvent(element: BpmnElement | BpmnModdleEl, listenerGroup: string) {
  if (listenerGroup === `flowable:TaskListener`) return 'create'

  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start'
}

export function getDefaultImplementationProperties(
  modeler: Modeler,
  type: ListenerImplementationType,
  value?: string
) {
  switch (type) {
    case 'class':
      return { ...DEFAULT_PROPS, class: value }
    case 'expression':
      return { ...DEFAULT_PROPS, expression: value }
    case 'delegateExpression':
      return { ...DEFAULT_PROPS, delegateExpression: value }
    case 'script':
      return { ...DEFAULT_PROPS, script: createExElement(modeler, 'Script', {}) }
  }
}

export function getDefaultEventTypeProperties(modeler: Modeler, type: ListenerEventType) {
  switch (type) {
    case 'Timeout':
      return {
        ...DEFAULT_EVENT_PROPS,
        eventDefinitions: [createElement(modeler, 'bpmn:TimerEventDefinition', {})],
        event: type
      }
    default:
      return { ...DEFAULT_EVENT_PROPS, event: type }
  }
}

export function getListenersContainer(element: BpmnElement): BpmnModdleEl {
  const businessObject = getBusinessObject(element)

  return businessObject.get('processRef') || businessObject
}

export function initListenerTableData(listeners: BpmnModdleEl[]): Listener[] {
  return listeners.map((listener) => {
    const { class: classValue, expression, delegateExpression, event, fields } = listener

    const listenerContent: string | undefined = classValue || expression || delegateExpression
    const listenerType = getListenerType(listener)

    const r: Listener = {
      event: event as string,
      listenerType,
      listenerContent,
      fields: fields ? initListenerFieldData(fields) : []
    }
    return r
  })
}
export function initListenerFieldData(fields: BpmnModdleEl[]): Field[] {
  return fields.map((field) => {
    const { name: fieldName, string, expression } = field
    const fieldType = !!string ? 'string' : 'expression'
    return { fieldName, fieldType, fieldValue: string || expression }
  })
}

export function createListener(
  modeler: Modeler,
  listener: Listener,
  type: 'ExecutionListener' | 'TaskListener',
  parent?: BpmnModdleEl
): BpmnModdleEl {
  const { event, listenerType, listenerContent, fields } = listener
  const props: BpmnListener = { event }
  if (listenerType === 'class') {
    props.class = listenerContent
  } else if (listenerType === 'expression') {
    props.expression = listenerContent
  } else if (listenerType === 'delegateExpression') {
    props.delegateExpression = listenerContent
  }
  const bpmnListener = createExElement(modeler, type, props, parent)
  if (fields && fields.length) {
    ;(bpmnListener as BpmnListener).fields = fields.map((f) =>
      createField(modeler, f, bpmnListener)
    )
  }
  return bpmnListener
}

export function createField(modeler: Modeler, field: Field, listener?: BpmnModdleEl): BpmnModdleEl {
  const { fieldName, fieldType, fieldValue } = field
  const props: BpmnField = { name: fieldName }
  if (fieldType === 'string') {
    props.string = fieldValue
  } else {
    props.expression = fieldValue
  }
  return createExElement(modeler, 'Field', props, listener)
}
