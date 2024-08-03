import { AssigneeType, IdmAssigneeType } from '@/components/Panel/common/types'
import Modeler from 'bpmn-js/lib/Modeler'
import {
  generateAddExtensionCommand,
  getExExtensionElementsList
} from '@/utils/extension-elements-utils'
import { createExElement } from '@/utils/element-utils'
import { is } from 'bpmn-js/lib/util/ModelUtil'

const IdmAssigneeTypeMap: Record<IdmAssigneeType, string | string[]> = {
  specify: 'IdmAssignee',
  starter: '',
  candidate: ['IdmCandidateUsers', 'IdmCandidateGroups']
  // candidate: 'IdmCandidateUsers'
}

export const resetAssigneeType = (
  modeler: Modeler,
  element: BpmnElement,
  type: AssigneeType
): CommandContext[] => {
  const assigneeType = getExExtensionElementsList(element.businessObject, 'AssigneeType')[0]
  const commands: CommandContext[] = []
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: assigneeType,
      properties: { body: type }
    }
  })
  if (type === 'idm') {
    const extensionElements = element.businessObject.get('extensionElements')
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [
            ...extensionElements.get('values'),
            createExElement(modeler, `IdmCandidateUsers`, { body: '' }, extensionElements),
            createExElement(modeler, `IdmCandidateGroups`, { body: '' }, extensionElements)
          ]
        }
      }
    })
  }
  return commands
}

export const removeStaticContext = (element: BpmnElement): CommandContext => {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: element.businessObject,
      properties: {
        assignee: undefined,
        candidateUsers: undefined,
        candidateGroups: undefined
      }
    }
  }
}
export const removeIdmCandidate = (element: BpmnElement): CommandContext | undefined => {
  const extensionElements = element.businessObject.get('extensionElements')
  if (!extensionElements) return
  return {
    cmd: 'element.updateModdleProperties',
    context: () => ({
      element,
      moddleElement: extensionElements,
      properties: {
        values: extensionElements.get('values').filter((ex: BpmnModdleEl) => {
          return !is(ex, 'flowable:IdmCandidateUsers') && !is(ex, 'flowable:IdmCandidateGroups')
        })
      }
    })
  }
}
export const removeIdmAssignee = (element: BpmnElement): CommandContext | undefined => {
  const extensionElements = element.businessObject.get('extensionElements')
  if (!extensionElements) return
  return {
    cmd: 'element.updateModdleProperties',
    context: () => ({
      element,
      moddleElement: extensionElements,
      properties: {
        values: extensionElements
          .get('values')
          .filter((ex: BpmnModdleEl) => !is(ex, 'flowable:IdmAssignee'))
      }
    })
  }
}

export const setBoProperty = (
  element: BpmnElement,
  type: string,
  value?: unknown
): CommandContext => {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: element.businessObject,
      properties: {
        [type]: value
      }
    }
  }
}
export const setModdleProperty = (
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  type: string,
  value?: unknown
): CommandContext => {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement,
      properties: {
        [type]: value
      }
    }
  }
}
export const setExtensionItem = (
  modeler: Modeler,
  element: BpmnElement,
  type: string,
  body: string = ''
): CommandContext | undefined => {
  const extensionElements = element.businessObject.get('extensionElements')
  if (!extensionElements) {
    return generateAddExtensionCommand(
      modeler,
      element,
      element.businessObject,
      createExElement(modeler, type, { body })
    )[0]
  }

  const exItem = getExExtensionElementsList(element.businessObject, type)?.[0]
  if (!exItem) {
    return {
      cmd: 'element.updateModdleProperties',
      context: () => ({
        element,
        moddleElement: extensionElements,
        properties: {
          values: [
            ...extensionElements.get('values'),
            createExElement(modeler, type, { body }, extensionElements)
          ]
        }
      })
    }
  }
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: exItem,
      properties: { body }
    }
  }
}
