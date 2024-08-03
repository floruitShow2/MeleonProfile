import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import Create from 'diagram-js/lib/features/create/Create'
import AutoPlace from 'diagram-js/lib/features/auto-place/AutoPlace'
import Mouse from 'diagram-js/lib/features/mouse/Mouse'
import { specialServiceTask } from '@/additional/providers/options'
import {
  PopupMenuEntries,
  PopupMenuEntryAction
} from 'diagram-js/lib/features/popup-menu/PopupMenuProvider'
import Translate from '@/additional/translate/ZhCnTranslate'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'

class CreatePopupProvider {
  static $inject: string[]

  private _elementFactory: ElementFactory
  private _bpmnFactory: BpmnFactory
  private _popupMenu: PopupMenu
  private _create: Create
  private _autoPlace: AutoPlace
  private _mouse: Mouse
  private _translate: typeof Translate

  constructor(
    elementFactory: ElementFactory,
    bpmnFactory: BpmnFactory,
    popupMenu: PopupMenu,
    create: Create,
    autoPlace: AutoPlace,
    mouse: Mouse,
    translate: typeof Translate
  ) {
    this._elementFactory = elementFactory
    this._bpmnFactory = bpmnFactory
    this._popupMenu = popupMenu
    this._create = create
    this._autoPlace = autoPlace
    this._mouse = mouse
    this._translate = translate

    this.register()
  }

  register() {
    this._popupMenu.registerProvider('bpmn-create', this)
  }

  getPopupMenuEntries() {
    const translate = this._translate
    const entries: PopupMenuEntries = {}

    for (const item of specialServiceTask) {
      const { className, actionName, label, target } = item

      const targetAction = this._createEntryAction(target)

      entries[`create-${actionName}`] = {
        label: this._translate(label),
        className,
        // @ts-expect-error
        group: {
          id: 'tasks',
          name: this._translate('Tasks')
        },
        rank: 1,
        action: {
          // @ts-expect-error
          click: targetAction,
          dragstart: targetAction
        }
      }
    }
    return entries
  }

  _createEntryAction(target: { type: string; childType?: string }): PopupMenuEntryAction {
    const create = this._create
    const mouse = this._mouse
    const popupMenu = this._popupMenu
    const elementFactory = this._elementFactory
    const bpmnFactory = this._bpmnFactory

    const { type, childType } = target

    return (event) => {
      popupMenu.close()
      const businessObject = bpmnFactory.create(type, { 'flowable:type': childType })
      const newElement = elementFactory.create('shape', { type, businessObject })

      if (event instanceof KeyboardEvent) {
        event = mouse.getLastMoveEvent()
      }

      return create.start(event, newElement)
    }
  }
}

CreatePopupProvider.$inject = [
  'elementFactory',
  'bpmnFactory',
  'popupMenu',
  'create',
  'autoPlace',
  'mouse',
  'translate'
]

export default CreatePopupProvider
