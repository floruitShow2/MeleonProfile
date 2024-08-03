import { is } from 'bpmn-js/lib/util/ModelUtil'

export type ScriptType = 'resource' | 'script' | ''

export const SCRIPT_PROPS = {
  script: undefined,
  resource: undefined,
  scriptFormat: undefined
}

export function getScriptTypeOptions(): PropertyOptions {
  return [
    { value: '', name: 'None' },
    { value: 'resource', name: 'ExternalResource' },
    { value: 'script', name: 'InlineScript' }
  ]
}

export function getScriptType(businessObject: BpmnModdleEl): ScriptType {
  // const businessObject = getBusinessObject(businessObject)

  const scriptValue = getScriptValue(businessObject)
  if (typeof scriptValue !== 'undefined') {
    return 'script'
  }

  const resource = businessObject.get(`flowable:resource`)
  if (typeof resource !== 'undefined') {
    return 'resource'
  }

  return ''
}

export function getScriptValue(businessObject) {
  return businessObject.get(getScriptProperty(businessObject))
}

export function isScript(element) {
  return is(element, `flowable:Script`)
}

export function getScriptProperty(businessObject) {
  return isScript(businessObject) ? 'value' : 'script'
}
