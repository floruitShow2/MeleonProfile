import { getExtensionElementsList } from '@/utils/extension-elements-utils'
import { createElement } from '@/utils/element-utils'
import { execPanelMultiCommands } from '@/utils/commandsExecute'
import { without } from 'min-dash'
import type Modeler from 'bpmn-js/lib/Modeler'

export function getProperties(bo: BpmnModdleEl): BpmnModdleEl[] {
  return getExtensionElementsList(bo, `flowable:Properties`)
}

export function getPropertiesList(properties: BpmnModdleEl) {
  return properties.get('values')
}

export function createProperty(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  props: Record<string, any>
): BpmnModdleEl {
  const commands: CommandContext[] = []

  let extensionElements = bo.get('extensionElements')

  // (1) ensure extension elements
  if (!extensionElements) {
    extensionElements = createElement(modeler, 'bpmn:ExtensionElements', { values: [] }, bo)

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: bo,
        properties: { extensionElements }
      }
    })
  }

  // (2) ensure camunda:Properties
  let properties: BpmnModdleEl = getProperties(bo)[0]

  if (!properties) {
    properties = createElement(
      modeler,
      `flowable:Properties`,
      {
        values: []
      },
      extensionElements
    )

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [...extensionElements.get('values'), properties]
        }
      }
    })
  }

  // (3) create camunda:Property
  const property = createElement(modeler, `flowable:Property`, props, properties)

  // (4) add property to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: properties,
      properties: {
        values: [...properties.get('values'), property]
      }
    }
  })

  execPanelMultiCommands(modeler, commands)

  return property
}

export function removeProperty(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  property: BpmnModdleEl
) {
  const commands: CommandContext[] = []

  const extensionElements = bo.get('extensionElements')
  const properties = getProperties(bo)[0]

  const values = without(properties.get('values'), property)

  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: properties,
      properties: { values }
    }
  })

  // remove camunda:Properties if there are no properties anymore
  if (!values.length) {
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: without(extensionElements.get('values'), properties)
        }
      }
    })
  }

  execPanelMultiCommands(modeler, commands)
}
