import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { isExpanded } from 'bpmn-js/lib/util/DiUtil'

export function isDifferentType(element: BpmnElement) {
  return function (entry) {
    const target = entry.target

    const businessObject = getBusinessObject(element),
      eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0]

    const isTypeEqual = businessObject.$type === target.type

    const isEventDefinitionEqual =
      (eventDefinition && eventDefinition.$type) === target.eventDefinitionType

    const isTriggeredByEventEqual = !!target.triggeredByEvent === !!businessObject.triggeredByEvent

    const isExpandedEqual =
      target.isExpanded === undefined || target.isExpanded === isExpanded(element)

    const useTypes =
      !isTypeEqual || !isEventDefinitionEqual || !isTriggeredByEventEqual || !isExpandedEqual

    const isChildTypeEqual = businessObject.get('type') === target.childType
    if (is(element, 'bpmn:ServiceTask')) {
      return useTypes || !isChildTypeEqual
    }
    return useTypes || businessObject.get('type') !== target.childType
  }
}
