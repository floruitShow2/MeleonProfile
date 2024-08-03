import { without } from 'min-dash'
import { updateModdleProp } from '@/utils/modeling'
import Modeler from 'bpmn-js/lib/Modeler'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'

export const DOCUMENTATION_TEXT_FORMAT = 'text/plain' as const

export function findDocumentation(docs: BpmnModdleEl): BpmnModdleEl | undefined {
  return docs.find(function (d: BpmnModdleEl) {
    return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT
  })
}
export function getDocumentation(businessObject: BpmnModdleEl): string | undefined {
  const documentation = findDocumentation(businessObject && businessObject.get('documentation'))
  return documentation && documentation.text
}

export function setDocumentation(
  modeler: Modeler,
  element: BpmnElement,
  businessObject: BpmnModdleEl,
  value: string
) {
  let documentation = findDocumentation(businessObject && businessObject.get('documentation'))
  // (1) update or removing existing documentation
  if (documentation) {
    if (value) {
      return updateModdleProp(modeler.get('modeling'), element, documentation, 'text', value)
    } else {
      return updateModdleProp(
        modeler.get('modeling'),
        element,
        businessObject,
        'documentation',
        without(businessObject.get('documentation'), documentation)
      )
    }
  }
  // (2) create new documentation entry
  const bpmnFactory = modeler.get<BpmnFactory>('bpmnFactory')
  if (value) {
    documentation = bpmnFactory.create('bpmn:Documentation', {
      text: value
    })
    updateModdleProp(modeler.get('modeling'), element, businessObject, 'documentation', [
      ...businessObject.get('documentation'),
      documentation
    ])
  }
}
