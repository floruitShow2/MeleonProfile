import { updateModdleProps } from '@/utils/modeling'
import { createElement, externalIs } from '@/utils/element-utils'
import { getTimerEventDefinition } from '@/utils/event-definition-utils'
import type Modeler from 'bpmn-js/lib/Modeler'

export const TimerTypeOptions: PropertyOptions = [
  { value: 'timeDate', name: 'Date' },
  { value: 'timeDuration', name: 'Duration' },
  { value: 'timeCycle', name: 'Cycle' }
]

export function isTimerSupportedOnListener(listener: BpmnModdleEl): boolean {
  return (listener &&
    externalIs(listener, 'TaskListener') &&
    getTimerEventDefinition(listener)) as boolean
}

export function setTimerEventDefinitionType(
  modeler: Modeler,
  element: BpmnElement,
  timerEventDefinition: BpmnModdleEl,
  value: string
) {
  // (1) Create empty formalExpression element
  const formalExpression = createElement(
    modeler,
    'bpmn:FormalExpression',
    { body: undefined },
    timerEventDefinition
  )

  // (2) Set the value for selected timerEventDefinitionType
  const newProps = {
    timeDuration: undefined,
    timeDate: undefined,
    timeCycle: undefined
  }

  if (value !== '') {
    newProps[value] = formalExpression
  }

  // (3) Execute businessObject update
  updateModdleProps(modeler.get('modeling'), element, timerEventDefinition, newProps)
}

export function setTimerEventDefExpression(
  modeler: Modeler,
  element: BpmnElement,
  timerEventDefinition: BpmnModdleEl,
  value: string
) {
  updateModdleProps(modeler.get('modeling'), element, timerEventDefinition, {
    id: element.id,
    body: value
  })
}
