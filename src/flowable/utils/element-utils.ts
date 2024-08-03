import type Modeler from 'bpmn-js/lib/Modeler'
import type BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'

import Ids from 'ids'
import { is } from 'bpmn-js/lib/util/ModelUtil'

export function externalIs(element: BpmnElement | BpmnModdleEl, type: string): boolean {
  const externalType = `flowable:${type}`
  return is(element, externalType)
}

/**
 * Create a new element and set its parent.
 */
export function createElement(
  modeler: Modeler,
  elementType: string,
  properties: Record<string, unknown>,
  parent?: BpmnModdleEl
): BpmnModdleEl {
  const factory = modeler.get<BpmnFactory>('bpmnFactory')
  const element = factory!.create(elementType, properties)

  const normalizeProps: Record<string, unknown> = {}
  for (const key in properties) {
    normalizeProps[`flowable:${key}`] =
      properties[key] === '' ? undefined : properties[key] || undefined
  }

  if (parent) {
    element.$parent = parent
  }

  return element
}

/**
 * Create a new element and set its parent.
 */
export function createExElement(
  modeler: Modeler,
  elementType: string,
  properties: Record<string, unknown>,
  parent?: BpmnModdleEl
): BpmnModdleEl {
  const exType = `flowable:${elementType}`
  const factory = modeler.get<BpmnFactory>('bpmnFactory')
  const element = factory.create(exType, properties)

  if (parent) {
    element.$parent = parent
  }

  return element
}

/**
 * generate a semantic id with given prefix
 */
export function nextId(prefix: string): string {
  const ids = new Ids([32, 32, 1])

  return ids.nextPrefixed(`${prefix}_`)
}

/**
 * get root element
 * The param's type is BpmnModdleEl
 */
export function getRoot(businessObject: BpmnModdleEl): BpmnRoot {
  let parent = businessObject

  while (parent.$parent) {
    parent = parent.$parent
  }

  return parent
}

export function filterElementsByType<T extends BpmnElement | BpmnModdleEl>(
  objectList: T[],
  type: string
): T[] {
  const list = objectList || []
  return list.filter((element) => is(element, type))
}

export function findRootElementsByType(
  businessObject: BpmnModdleEl,
  referencedType: string
): BpmnRoot[] {
  const root = getRoot(businessObject)
  return filterElementsByType(root.get('rootElements'), referencedType)
}

export function findRootElementById(
  businessObject: BpmnModdleEl,
  type: string,
  id: string
): BpmnRoot | undefined {
  const elements = findRootElementsByType(businessObject, type)
  return elements.find((element) => element.id === id)
}
