import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { add as collectionAdd } from 'diagram-js/lib/util/Collections'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'

import { isIdValid } from '@/utils/bpmn-validators'
import {
  getExPropValue,
  updateElementProp,
  updateExModdleProp,
  updateModdleProp
} from '@/utils/modeling'

////////////////////// self helpers
export function hasNameProperty(element: BpmnElement): boolean {
  return !isAny(element, ['bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association'])
}
export function createCategoryValue(definitions, bpmnFactory): BpmnModdleEl {
  const categoryValue = bpmnFactory.create('bpmn:CategoryValue')
  const category = bpmnFactory.create('bpmn:Category', {
    categoryValue: [categoryValue]
  })
  collectionAdd(definitions.get('rootElements'), category, -1)
  getBusinessObject(category).$parent = definitions
  getBusinessObject(categoryValue).$parent = category

  return categoryValue
}

export function initializeCategory(businessObject, rootElement, bpmnFactory) {
  const definitions = getBusinessObject(rootElement).$parent
  businessObject.categoryValueRef = createCategoryValue(definitions, bpmnFactory)
}

////////////////////// Name
export function getNameValue(element: BpmnElement): string | undefined {
  if (is(element, 'bpmn:TextAnnotation')) {
    return element.businessObject.text
  }
  if (is(element, 'bpmn:Group')) {
    const businessObject: BpmnModdleEl = getBusinessObject(element),
      categoryValueRef = businessObject?.categoryValueRef
    return categoryValueRef?.value
  }
  return element.businessObject.name
}
export function setNameValue(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  name: string
): void {
  const modeling = modeler.get<Modeling>('modeling')
  const canvas = modeler.get<Canvas>('canvas')
  const bpmnFactory = modeler.get<BpmnFactory>('bpmnFactory')
  if (is(element, 'bpmn:TextAnnotation')) {
    return updateElementProp(modeling, element, 'text', name)
  }
  if (is(element, 'bpmn:Group')) {
    const businessObject = getBusinessObject(element),
      categoryValueRef = businessObject.categoryValueRef
    if (!categoryValueRef) {
      initializeCategory(businessObject, canvas?.getRootElement(), bpmnFactory)
    }
    return modeling?.updateLabel(element, name)
  }
  updateModdleProp(modeler.get('modeling'), element, bo, 'name', name)
}

////////////////////// Id
export function getIdValue(element: BpmnElement): string {
  return element.businessObject.id
}
export function setIdValue(modeler: Modeler, element: BpmnElement, id: string) {
  const errorMsg = isIdValid(element.businessObject, id)
  if (errorMsg && errorMsg.length) {
    return errorMsg
  }
  updateElementProp(modeler.get('modeling'), element, 'id', id)
}

///////////////////// ProcessRef: processId & processName
export function getProcessIdAndName(element: BpmnElement): { id: string; name: string } {
  const process = element.businessObject.get('processRef')
  return { id: process?.get('id') || '', name: process?.get('name') || '' }
}
export function setProcessIdValue(modeler: Modeler, element: BpmnElement, id: string) {
  const process = element.businessObject.get('processRef')
  updateModdleProp(modeler.get('modeling'), element, process, 'id', id)
}
export function setProcessNameValue(modeler: Modeler, element: BpmnElement, name: string) {
  const process = element.businessObject.get('processRef')
  updateModdleProp(modeler.get('modeling'), element, process, 'name', name)
}

///////////////////// Executable
export function getProcessExecutable(bo: BpmnModdleEl): boolean {
  return bo.get('isExecutable')
}
export function setProcessExecutable(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  isExecutable: boolean
) {
  updateModdleProp(modeler.get('modeling'), element, bo, 'isExecutable', isExecutable)
}
///////////////////// candidateStarterGroups
export function getCandidateStarterGroups(bo: BpmnModdleEl): string {
  return getExPropValue(bo, 'candidateStarterGroups')
}
export function setCandidateStarterGroups(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  value: string
) {
  return updateExModdleProp(modeler.get('modeling'), element, bo, 'candidateStarterGroups', value)
}
///////////////////// candidateStarterUsers
export function getCandidateStarterUsers(bo: BpmnModdleEl): string {
  return getExPropValue(bo, 'candidateStarterUsers')
}
export function setCandidateStarterUsers(
  modeler: Modeler,
  element: BpmnElement,
  bo: BpmnModdleEl,
  value: string
) {
  return updateExModdleProp(modeler.get('modeling'), element, bo, 'candidateStarterUsers', value)
}
