import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'
import { isConditionalFlow } from '@/helpers/common-helpers'
import Translate from '@/additional/translate'

import type Injector from 'diagram-js/lib/Diagram'
import type ContextPad from 'diagram-js/lib/features/context-pad/ContextPad'
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import type ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
import type Connect from 'diagram-js/lib/features/connect/Connect'
import type Create from 'diagram-js/lib/features/create/Create'
import type PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type Rules from 'diagram-js/lib/features/rules/Rules'
import type EventBus from 'diagram-js/lib/core/EventBus'
import type AppendPreview from 'bpmn-js/lib/features/append-preview/AppendPreview'
import type AutoPlace from 'diagram-js/lib/features/auto-place/AutoPlace'

class EnhancementContextPadProvider extends ContextPadProvider {
  private _contextPad: ContextPad
  private _modeling: Modeling
  private _elementFactory: ElementFactory
  private _connect: Connect
  private _create: Create
  private _popupMenu: PopupMenu
  private _canvas: Canvas
  private _rules: Rules
  private _translate: typeof Translate
  private _autoPlace: AutoPlace
  constructor(
    config: Record<string, any>,
    injector: Injector,
    eventBus: EventBus,
    contextPad: ContextPad,
    modeling: Modeling,
    elementFactory: ElementFactory,
    connect: Connect,
    create: Create,
    popupMenu: PopupMenu,
    canvas: Canvas,
    rules: Rules,
    translate: typeof Translate,
    appendPreview: AppendPreview
  ) {
    super(
      config,
      injector,
      eventBus,
      contextPad,
      modeling,
      elementFactory,
      connect,
      create,
      popupMenu,
      canvas,
      rules,
      translate,
      // @ts-expect-error
      appendPreview
    )

    this._contextPad = contextPad
    this._modeling = modeling
    this._elementFactory = elementFactory
    this._connect = connect
    this._create = create
    this._popupMenu = popupMenu
    this._canvas = canvas
    this._rules = rules
    this._translate = translate

    this._autoPlace = injector.get('autoPlace', false)!
  }

  getContextPadEntries(element: BpmnElement) {
    const modeling = this._modeling
    const autoPlace = this._autoPlace
    const elementFactory = this._elementFactory
    const create = this._create
    const actions = super.getContextPadEntries(element)

    if (actions['append.append-task']) {
      const appendUserTask = (event, element) => {
        const shape = elementFactory.createShape({ type: 'bpmn:UserTask' })
        create.start(event, shape, {
          source: element
        })
      }
      const createUserTask = this._autoPlace
        ? (event, element) => {
            const shape = elementFactory.createShape({ type: 'bpmn:UserTask' })
            autoPlace.append(element, shape)
          }
        : appendUserTask

      actions['append.append-task'] = {
        group: 'model',
        className: 'bpmn-icon-user-task',
        title: '追加用户任务',
        action: {
          dragstart: appendUserTask,
          click: createUserTask
        }
      }
    }

    if (actions['append.compensation-activity']) {
      const appendServiceTask = (event, element) => {
        const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' })
        create.start(event, shape, {
          source: element
        })
      }
      const createUserTask = this._autoPlace
        ? (event, element) => {
            const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' })
            autoPlace.append(element, shape)
          }
        : appendServiceTask

      actions['append.compensation-activity'] = {
        group: 'model',
        className: 'bpmn-icon-service-task',
        title: '追加补偿服务任务',
        action: {
          dragstart: appendServiceTask,
          click: createUserTask
        }
      }
    }

    // 默认连线
    if (
      isConditionalFlow(element) &&
      element.businessObject.sourceRef?.default !== element.businessObject
    ) {
      actions['edit.replace-default'] = {
        group: 'edit',
        className: 'bpmn-icon-default-flow',
        title: '设为默认流',
        action: {
          click: () => {
            modeling.updateProperties(element.source, { default: element.businessObject })
          }
        }
      }
    }

    return actions
  }
}

export default EnhancementContextPadProvider
