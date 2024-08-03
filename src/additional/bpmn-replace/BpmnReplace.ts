import { pick, assign, filter, forEach, isArray, isUndefined, has } from 'min-dash'
import { isEventSubProcess, isExpanded } from 'bpmn-js/lib/util/DiUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import ModdleCopy, { getPropertyNames } from 'bpmn-js/lib/features/copy-paste/ModdleCopy'
import { ModdleElement } from 'bpmn-js/lib/model/Types'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import Replace from 'diagram-js/lib/features/replace/Replace'
import Rules from 'diagram-js/lib/features/rules/Rules'

function copyProperties(
  source: ModdleElement,
  target: ModdleElement,
  properties: string | string[]
) {
  if (!isArray(properties)) {
    properties = [properties]
  }

  forEach(properties, function (property) {
    if (!isUndefined(source[property])) {
      target[property] = source[property]
    }
  })
}

const CUSTOM_PROPERTIES = [
  'cancelActivity',
  'instantiate',
  'eventGatewayType',
  'triggeredByEvent',
  'isInterrupting'
]

function shouldToggleCollapsed(element: BpmnElement, targetElement: BpmnElement): boolean {
  const oldCollapsed =
    element && has(element, 'collapsed') ? element.collapsed : !isExpanded(element)

  let targetCollapsed

  if (targetElement && (has(targetElement, 'collapsed') || has(targetElement, 'isExpanded'))) {
    targetCollapsed = has(targetElement, 'collapsed')
      ? targetElement.collapsed
      : !targetElement.isExpanded
  } else {
    targetCollapsed = oldCollapsed
  }

  return oldCollapsed !== targetCollapsed
}

function isSubProcess(businessObject: BpmnModdleEl): boolean {
  return is(businessObject, 'bpmn:SubProcess')
}

function hasEventDefinition(element: BpmnElement | BpmnModdleEl, type: string): BpmnModdleEl {
  const businessObject = getBusinessObject(element)

  return type && businessObject.get('eventDefinitions').some((definition) => is(definition, type))
}

function intersection(a, b) {
  return a.filter((item) => b.includes(item))
}

class BpmnReplace {
  static $inject: string[]

  public replaceElement: (
    element: BpmnElement,
    targetElement: BpmnElement,
    hints?: any
  ) => BpmnElement

  constructor(
    bpmnFactory: BpmnFactory,
    elementFactory: ElementFactory,
    moddleCopy: ModdleCopy,
    modeling: Modeling,
    replace: Replace,
    rules: Rules
  ) {
    function replaceElement(element: BpmnElement, targetElement: BpmnElement, hints?: any) {
      hints = hints || {}

      const type = targetElement.type
      const childType = targetElement.childType
      const oldBusinessObject = element.businessObject

      if (isSubProcess(oldBusinessObject) && type === 'bpmn:SubProcess') {
        if (shouldToggleCollapsed(element, targetElement)) {
          // expanding or collapsing process
          modeling.toggleCollapse(element)

          return element
        }
      }

      let newBusinessObject = bpmnFactory.create(type)

      // ************* 设置服务任务的其他类
      newBusinessObject.type = childType
      // 只有http服务任务存在的属性
      newBusinessObject.parallelInSameTransaction = childType === 'http' || undefined

      const newElement: BpmnModdleEl = {
        type: type,
        businessObject: newBusinessObject
      }

      newElement.di = {}

      if (type === 'bpmn:ExclusiveGateway') {
        newElement.di.isMarkerVisible = true
      }

      // colors will be set to DI
      copyProperties(element.di, newElement.di, [
        'fill',
        'stroke',
        'background-color',
        'border-color',
        'color'
      ])

      // @ts-expect-error
      const elementProps = getPropertyNames(oldBusinessObject.$descriptor)
      const newElementProps = getPropertyNames(newBusinessObject.$descriptor, true)
      const copyProps = intersection(elementProps, newElementProps)

      assign(newBusinessObject, pick(targetElement, CUSTOM_PROPERTIES))

      const properties: string[] = filter(copyProps, (propertyName) => {
        if (propertyName === 'eventDefinitions') {
          return hasEventDefinition(element, targetElement.eventDefinitionType)
        }
        if (propertyName === 'loopCharacteristics') {
          return !isEventSubProcess(newBusinessObject)
        }
        if (has(newBusinessObject, propertyName)) {
          return false
        }
        if (propertyName === 'processRef' && targetElement.isExpanded === false) {
          return false
        }
        if (propertyName === 'triggeredByEvent') {
          return false
        }
        // **************** 服务任务相关时清空 extensionElements
        if (propertyName === 'extensionElements' && (oldBusinessObject.type || childType)) {
          return false
        }
        if (propertyName === 'isForCompensation') {
          return !isEventSubProcess(newBusinessObject)
        }
        return true
      })

      newBusinessObject = moddleCopy.copyElement(oldBusinessObject, newBusinessObject, properties)

      if (targetElement.eventDefinitionType) {
        if (!hasEventDefinition(newBusinessObject, targetElement.eventDefinitionType)) {
          newElement.eventDefinitionType = targetElement.eventDefinitionType
          newElement.eventDefinitionAttrs = targetElement.eventDefinitionAttrs
        }
      }

      if (is(oldBusinessObject, 'bpmn:Activity')) {
        if (isSubProcess(oldBusinessObject)) {
          newElement.isExpanded = isExpanded(element)
        } else if (targetElement && has(targetElement, 'isExpanded')) {
          newElement.isExpanded = targetElement.isExpanded

          const defaultSize = elementFactory.getDefaultSize(newBusinessObject, {
            isExpanded: newElement.isExpanded
          })

          newElement.width = defaultSize.width
          newElement.height = defaultSize.height

          // keep element centered
          newElement.x = element.x - (newElement.width - element.width) / 2
          newElement.y = element.y - (newElement.height - element.height) / 2
        }
        if (isExpanded(element) && !is(oldBusinessObject, 'bpmn:Task') && newElement.isExpanded) {
          newElement.width = element.width
          newElement.height = element.height
        }
      }

      // remove children if not expanding sub process
      if (isSubProcess(oldBusinessObject) && !isSubProcess(newBusinessObject)) {
        hints.moveChildren = false
      }

      // transform collapsed/expanded pools
      if (is(oldBusinessObject, 'bpmn:Participant')) {
        // create expanded pool
        if (targetElement.isExpanded === true) {
          newBusinessObject.processRef = bpmnFactory.create('bpmn:Process')
        } else {
          // remove children when transforming to collapsed pool
          hints.moveChildren = false
        }

        // apply same width and default height
        newElement.width = element.width
        newElement.height = elementFactory.getDefaultSize(newElement, undefined).height
      }

      if (!rules.allowed('shape.resize', { shape: newBusinessObject })) {
        newElement.height = elementFactory.getDefaultSize(newElement, undefined).height
        newElement.width = elementFactory.getDefaultSize(newElement, undefined).width
      }

      newBusinessObject.name = oldBusinessObject.name

      // retain default flow's reference between inclusive <-> exclusive gateways and activities
      if (
        isAny(oldBusinessObject, [
          'bpmn:ExclusiveGateway',
          'bpmn:InclusiveGateway',
          'bpmn:Activity'
        ]) &&
        isAny(newBusinessObject, [
          'bpmn:ExclusiveGateway',
          'bpmn:InclusiveGateway',
          'bpmn:Activity'
        ])
      ) {
        newBusinessObject.default = oldBusinessObject.default
      }

      if (
        targetElement.host &&
        !is(oldBusinessObject, 'bpmn:BoundaryEvent') &&
        is(newBusinessObject, 'bpmn:BoundaryEvent')
      ) {
        newElement.host = targetElement.host
      }

      // The DataStoreReference element is 14px wider than the DataObjectReference element
      // This ensures that they stay centered on the x axis when replaced
      if (
        newElement.type === 'bpmn:DataStoreReference' ||
        newElement.type === 'bpmn:DataObjectReference'
      ) {
        newElement.x = element.x + (element.width - newElement.width) / 2
      }

      return replace.replaceElement(element, newElement, { ...hints, targetElement })
    }

    this.replaceElement = replaceElement
  }
}

BpmnReplace.$inject = [
  'bpmnFactory',
  'elementFactory',
  'moddleCopy',
  'modeling',
  'replace',
  'rules'
]

export default BpmnReplace
