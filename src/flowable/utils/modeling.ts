import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'

export function getPropValue<T>(element: BpmnElement | BpmnModdleEl, propKey: string): T {
  return element && element.get ? element.get(propKey) : element ? element[propKey] : element
}

export function getExPropValue<T>(element: BpmnElement | BpmnModdleEl, propKey: string): T {
  const exPropKey = `flowable:${propKey}`
  return element && element.get ? element.get(exPropKey) : element ? element[exPropKey] : element
}

export const updateElementProp = (
  modeling: Modeling,
  element: BpmnElement,
  propKey: string,
  propValue: unknown
) => {
  modeling?.updateProperties(element, {
    [propKey]: normalizePropValue(propValue)
  })
}

export const updateElementExProp = (
  modeling: Modeling,
  element: BpmnElement,
  propKey: string,
  propValue: unknown
) => {
  const exPropKey = `flowable:${propKey}`

  modeling?.updateProperties(element, {
    [exPropKey]: normalizePropValue(propValue)
  })
}

export const updateModdleProp = (
  modeling: Modeling,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  propKey: string,
  propValue: unknown,
  normalize = true
) => {
  modeling?.updateModdleProperties(element, moddleElement, {
    [propKey]: normalize ? normalizePropValue(propValue) : propValue
  })
}

export const updateExModdleProp = (
  modeling: Modeling,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  propKey: string,
  propValue: unknown,
  normalize = true
) => {
  const exPropKey = `flowable:${propKey}`
  modeling?.updateModdleProperties(element, moddleElement, {
    [exPropKey]: normalize ? normalizePropValue(propValue) : propValue
  })
}
export const updateElementProps = (
  modeling: Modeling,
  element: BpmnElement,
  props: Record<string, unknown>,
  normalize = true
) => {
  modeling?.updateProperties(element, normalize ? normalizeProps(props) : props)
}

export const updateModdleProps = (
  modeling: Modeling,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  props: Record<string, unknown>,
  normalize = true
) => {
  if (normalize) {
    modeling?.updateModdleProperties(element, moddleElement, normalizeProps(props))
  } else {
    modeling?.updateModdleProperties(element, moddleElement, props)
  }
}

export const updateExModdleProps = (
  modeling: Modeling,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  props: Record<string, unknown>,
  normalize = true
) => {
  modeling?.updateModdleProperties(
    element,
    moddleElement,
    normalize ? normalizeProps(props) : props
  )
}

export const normalizePropValue = (value: any) => {
  if (value === '') return undefined
  return value
}

export const normalizeProps = (
  props: Record<string, any>,
  ex: boolean = false
): Record<string, any> => {
  const normalizeProps: Record<string, unknown> = {}
  for (const key in props) {
    normalizeProps[ex ? `flowable:${key}` : key] = normalizePropValue(props[key])
  }

  return normalizeProps
}
