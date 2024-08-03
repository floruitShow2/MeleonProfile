import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import Create from 'diagram-js/lib/features/create/Create'
import AutoPlace from 'diagram-js/lib/features/auto-place/AutoPlace'
import Mouse from 'diagram-js/lib/features/mouse/Mouse'
import Translate from '@/additional/translate/ZhCnTranslate'
import Rules from 'diagram-js/lib/features/rules/Rules'
import { PopupMenuEntryAction } from 'diagram-js/lib/features/popup-menu/PopupMenuProvider'
import { specialServiceTask } from '@/additional/providers/options'

class AppendPopupProvider {
  static $inject: string[]

  private _elementFactory: ElementFactory
  private _bpmnFactory: BpmnFactory
  private _popupMenu: PopupMenu
  private _create: Create
  private _autoPlace: AutoPlace
  private _rules: Rules
  private _mouse: Mouse
  private _translate: typeof Translate

  constructor(
    elementFactory: ElementFactory,
    bpmnFactory: BpmnFactory,
    popupMenu: PopupMenu,
    create: Create,
    autoPlace: AutoPlace,
    rules: Rules,
    mouse: Mouse,
    translate: typeof Translate
  ) {
    this._elementFactory = elementFactory
    this._bpmnFactory = bpmnFactory
    this._popupMenu = popupMenu
    this._create = create
    this._autoPlace = autoPlace
    this._rules = rules
    this._mouse = mouse
    this._translate = translate

    this.register()
  }

  register() {
    this._popupMenu.registerProvider('bpmn-append', this)
  }

  getPopupMenuEntries(element: BpmnElement) {
    const rules = this._rules
    const translate = this._translate

    const entries = {}

    if (!rules.allowed('shape.append', { element })) {
      return []
    }

    for (const item of specialServiceTask) {
      const { className, actionName, label, target } = item

      const targetAction = this._createEntryAction(element, target)

      entries[`append-${actionName}`] = {
        label: this._translate(label),
        className,
        group: {
          id: 'tasks',
          name: this._translate('Tasks')
        },
        rank: 1,
        action: targetAction
      }
    }
    return entries
  }

  _createEntryAction(
    element: BpmnElement,
    target: { type: string; childType?: string }
  ): PopupMenuEntryAction {
    const elementFactory = this._elementFactory
    const bpmnFactory = this._bpmnFactory
    const autoPlace = this._autoPlace
    const create = this._create
    const mouse = this._mouse

    const { type, childType } = target

    const autoPlaceElement = () => {
      const businessObject = bpmnFactory.create(type, { 'flowable:type': childType })
      const newElement = elementFactory.create('shape', { type, businessObject })
      autoPlace.append(element, newElement)
    }

    const manualPlaceElement = (event) => {
      const businessObject = bpmnFactory.create(type, { 'flowable:type': childType })
      const newElement = elementFactory.create('shape', { type, businessObject })

      if (event instanceof KeyboardEvent) {
        event = mouse.getLastMoveEvent()
      }

      return create.start(event, newElement, {
        source: element
      })
    }

    return {
      // @ts-expect-error
      click: this._canAutoPlaceElement(target) ? autoPlaceElement : manualPlaceElement,
      dragstart: manualPlaceElement
    }
  }

  _canAutoPlaceElement(target: BpmnElement) {
    const { type } = target

    if (type === 'bpmn:BoundaryEvent') {
      return false
    }

    if (type === 'bpmn:SubProcess' && target.triggeredByEvent) {
      return false
    }

    if (
      type === 'bpmn:IntermediateCatchEvent' &&
      target.eventDefinitionType === 'bpmn:LinkEventDefinition'
    ) {
      return false
    }

    return true
  }
}

AppendPopupProvider.$inject = [
  'elementFactory',
  'bpmnFactory',
  'popupMenu',
  'create',
  'autoPlace',
  'rules',
  'mouse',
  'translate'
]

export default AppendPopupProvider
