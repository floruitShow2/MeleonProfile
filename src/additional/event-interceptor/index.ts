import type Modeler from 'bpmn-js/lib/Modeler'
import type { Rect } from 'diagram-js/lib/util/Types'
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import { createElement, createExElement } from '@/utils/element-utils'
import { isEmptyStartEvent } from '@/utils/element-supported'
import { is } from 'bpmn-js/lib/util/ModelUtil'

type ElementCreateContext = {
  parent: BpmnElement
  parentIndex: number
  position: Rect
  rootElement: BpmnRoot
  shape: BpmnElement
  host?: BpmnModdleEl
  hints?: Record<string, unknown>
}
type AutoPlaceContext = {
  source: BpmnElement
  shape: BpmnElement
}

export function addElementCreateInterceptor(modeler: Modeler) {
  const modeling = modeler.get<Modeling>('modeling')
  modeler.on(
    'commandStack.shape.create.postExecute',
    ({ context }: { context: ElementCreateContext }) => {
      const shape = context.shape
      const type = shape.type
      switch (type) {
        // 1. 处理用户任务默认的任务分配
        case 'bpmn:UserTask':
          modeling.updateModdleProperties(shape, shape.businessObject, {
            extensionElements: createElement(modeler, 'bpmn:ExtensionElements', {
              values: [
                createElement(modeler, `flowable:AssigneeType`, {
                  body: 'static'
                })
              ]
            })
          })
          break
        // 2. 处理空开始节点
        case 'bpmn:StartEvent':
          modeling.updateModdleProperties(shape, shape.businessObject, {
            initiator: isEmptyStartEvent(shape) ? 'initiator' : undefined
          })
          break
        // 3. 决策任务节点
        case 'bpmn:ServiceTask':
          const bo = shape.businessObject
          if (bo.type === 'dmn') {
            modeling.updateModdleProperties(shape, shape.businessObject, {
              extensionElements: createElement(modeler, 'bpmn:ExtensionElements', {
                values: [
                  createExElement(modeler, 'Field', {
                    name: 'fallbackToDefaultTenant',
                    string: 'false'
                  }),
                  createExElement(modeler, 'Field', {
                    name: 'decisionTaskThrowErrorOnNoHits',
                    string: 'false'
                  })
                ]
              })
            })
          }
          break
      }
    }
  )

  modeler.on('autoPlace.end', 1000, ({ source, shape }: AutoPlaceContext) => {
    const type = shape.type
    switch (type) {
      // 1. 开始事件之后的首个任务节点设置默认变量
      case 'bpmn:UserTask':
        // 直接赋值，避免多个操作步骤
        if (previousStartEventCheck(source)) {
          shape.businessObject.skipExpression = `\${initiator == ''}`
          shape.businessObject.assignee = '${initiator}'
        }
        break
    }
  })
}

function previousStartEventCheck(source: BpmnElement): boolean {
  return is(source, 'bpmn:StartEvent') && isEmptyStartEvent(source)
}
