import type { PaletteEntries, PaletteEntry } from 'diagram-js/lib/features/palette/PaletteProvider'
import { assign } from 'min-dash'

class EnhancementPaletteProvider {
  private _palette: any
  private _spaceTool: any
  private _lassoTool: any
  private _handTool: any
  private _globalConnect: any
  private _elementFactory: any
  private _create: any
  private _translate: any
  static $inject: string[]
  constructor(
    palette,
    create,
    elementFactory,
    spaceTool,
    lassoTool,
    handTool,
    globalConnect,
    translate
  ) {
    this._palette = palette
    this._create = create
    this._elementFactory = elementFactory
    this._spaceTool = spaceTool
    this._lassoTool = lassoTool
    this._handTool = handTool
    this._globalConnect = globalConnect
    this._translate = translate

    palette.registerProvider(this)
  }

  getPaletteEntries(): PaletteEntries {
    const actions: PaletteEntries = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      globalConnect = this._globalConnect,
      translate = this._translate

    function createAction(
      type: string,
      group: string,
      className: string,
      title: string,
      options?
    ): PaletteEntry {
      function createListener(event: MouseEvent) {
        const shape = elementFactory.createShape(assign({ type: type }, options))
        create.start(event, shape)
      }

      return {
        group: group,
        className: className,
        title: title,
        action: {
          // @ts-expect-error
          dragstart: createListener,
          click: createListener
        }
      }
    }

    function createSubprocess(event: MouseEvent) {
      const subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        x: 0,
        y: 0,
        isExpanded: true
      })

      const startEvent = elementFactory.createShape({
        type: 'bpmn:StartEvent',
        x: 40,
        y: 82,
        parent: subProcess
      })

      create.start(event, [subProcess, startEvent], {
        hints: {
          autoSelect: [subProcess]
        }
      })
    }

    function createParticipant(event: MouseEvent) {
      create.start(event, elementFactory.createParticipantShape())
    }

    assign(actions, {
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: translate('Activate hand tool'),
        action: {
          click: function (event: MouseEvent) {
            handTool.activateHand(event)
          }
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: translate('Activate lasso tool'),
        action: {
          click: function (event: MouseEvent) {
            lassoTool.activateSelection(event)
          }
        }
      },
      'space-tool': {
        group: 'tools',
        className: 'bpmn-icon-space-tool',
        title: translate('Activate create/remove space tool'),
        action: {
          click: function (event: MouseEvent) {
            spaceTool.activateSelection(event)
          }
        }
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: translate('Activate global connect tool'),
        action: {
          click: function (event: MouseEvent) {
            globalConnect.start(event)
          }
        }
      },
      'tool-separator': {
        group: 'tools',
        separator: true
      },
      'create.start-event': createAction(
        'bpmn:StartEvent',
        'start-event',
        'bpmn-icon-start-event-none',
        translate('Create start event')
      ),
      'create.user-task': createAction(
        'bpmn:UserTask',
        'activity',
        'bpmn-icon-user-task',
        translate('Create user task')
      ),
      'create.exclusive-gateway': createAction(
        'bpmn:ExclusiveGateway',
        'gateway',
        'bpmn-icon-gateway-none',
        translate('Create gateway')
      ),
      'create.end-event': createAction(
        'bpmn:EndEvent',
        'end-event',
        'bpmn-icon-end-event-none',
        translate('Create end event')
      ),
      'create.intermediate-event': createAction(
        'bpmn:IntermediateThrowEvent',
        'im-event',
        'bpmn-icon-intermediate-event-none',
        translate('Create intermediate/boundary event')
      ),
      'create.subprocess-expanded': {
        group: 'sub-activity',
        className: 'bpmn-icon-subprocess-expanded',
        title: translate('Create expanded sub-process'),
        action: {
          dragstart: createSubprocess,
          click: createSubprocess
        }
      },
      'create.participant-expanded': {
        group: 'collaboration',
        className: 'bpmn-icon-participant',
        title: translate('Create pool/participant'),
        action: {
          dragstart: createParticipant,
          click: createParticipant
        }
      }
    })

    return actions
  }
}

EnhancementPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate'
]

export default EnhancementPaletteProvider
