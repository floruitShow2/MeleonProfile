import BaseProvider from 'bpmn-js/lib/features/popup-menu/ReplaceMenuProvider'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { forEach, filter, isArray } from 'min-dash'
import { isDifferentType } from '@/additional/bpmn-replace/BpmnReplaceUtil'
import * as replaceOptions from '../bpmn-replace/ReplaceOptions'

import { PopupMenuTarget } from 'diagram-js/lib/features/popup-menu/PopupMenu'
import { ReplaceOption } from 'bpmn-js/lib/features/replace/ReplaceOptions'
import { PopupMenuEntries } from 'diagram-js/lib/features/popup-menu/PopupMenuProvider'
import { isEventSubProcess, isExpanded } from 'bpmn-js/lib/util/DiUtil'

type CreateEntries = (a: PopupMenuTarget, b: ReplaceOption[]) => PopupMenuEntries

class ReplaceMenuProvider extends BaseProvider {
  private _bpmnFactory: any
  private _popupMenu: any
  private _modeling: any
  private _moddle: any
  private _bpmnReplace: any
  private _rules: any
  private _translate: any
  private _moddleCopy: any
  private _createEntries: CreateEntries

  constructor(bpmnFactory, popupMenu, modeling, moddle, bpmnReplace, rules, translate, moddleCopy) {
    super(bpmnFactory, popupMenu, modeling, moddle, bpmnReplace, rules, translate, moddleCopy)

    this._bpmnFactory = bpmnFactory
    this._popupMenu = popupMenu
    this._modeling = modeling
    this._moddle = moddle
    this._bpmnReplace = bpmnReplace
    this._rules = rules
    this._translate = translate
    this._moddleCopy = moddleCopy

    // @ts-expect-error
    this._register()

    // @ts-expect-error
    this._createEntries = super._createEntries as CreateEntries
  }

  _getLoopCharacteristicsHeaderEntries(target) {
    const translate = this._translate
    const modeling = this._modeling
    const moddle = this._moddle
    const moddleCopy = this._moddleCopy

    const toggleLoopEntry = (event, entry) => {
      // remove
      if (entry.active) {
        modeling.updateProperties(target, { loopCharacteristics: undefined })
        return
      }

      const currentLoopCharacteristics = target.businessObject.get('loopCharacteristics'),
        newLoopCharacteristics = moddle.create(entry.options.loopCharacteristics)

      // copy old properties
      if (currentLoopCharacteristics) {
        moddleCopy.copyElement(currentLoopCharacteristics, newLoopCharacteristics)
      }
      // update `isSequential` property
      newLoopCharacteristics.set('isSequential', entry.options.isSequential)

      modeling.updateProperties(target, { loopCharacteristics: newLoopCharacteristics })
    }

    const businessObject = getBusinessObject(target),
      loopCharacteristics = businessObject.loopCharacteristics

    let isSequential, isParallel

    if (loopCharacteristics) {
      isSequential = loopCharacteristics.isSequential
      isParallel =
        loopCharacteristics.isSequential !== undefined && !loopCharacteristics.isSequential
    }

    return {
      'toggle-parallel-mi': {
        className: 'bpmn-icon-parallel-mi-marker',
        title: translate('Parallel multi-instance'),
        active: isParallel,
        action: toggleLoopEntry,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: false
        }
      },
      'toggle-sequential-mi': {
        className: 'bpmn-icon-sequential-mi-marker',
        title: translate('Sequential multi-instance'),
        active: isSequential,
        action: toggleLoopEntry,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: true
        }
      }
    }
  }

  getPopupMenuEntries(target) {
    const businessObject = target.businessObject

    const rules = this._rules

    let filteredReplaceOptions: ReplaceOption[] = []

    if (isArray(target) || !rules.allowed('shape.replace', { element: target })) {
      return {}
    }

    const differentType = isDifferentType(target)

    if (is(businessObject, 'bpmn:DataObjectReference')) {
      return this._createEntries(target, replaceOptions.DATA_OBJECT_REFERENCE)
    }

    if (is(businessObject, 'bpmn:DataStoreReference') && !is(target.parent, 'bpmn:Collaboration')) {
      return this._createEntries(target, replaceOptions.DATA_STORE_REFERENCE)
    }

    // start events outside sub processes
    if (is(businessObject, 'bpmn:StartEvent') && !is(businessObject.$parent, 'bpmn:SubProcess')) {
      filteredReplaceOptions = filter(replaceOptions.START_EVENT, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // expanded/collapsed pools
    if (is(businessObject, 'bpmn:Participant')) {
      // @ts-expect-error
      filteredReplaceOptions = filter(replaceOptions.PARTICIPANT, function (replaceOption) {
        return isExpanded(target) !== replaceOption.target.isExpanded
      })

      return this._createEntries(target, filteredReplaceOptions)
    }

    // start events inside event sub processes
    if (is(businessObject, 'bpmn:StartEvent') && isEventSubProcess(businessObject.$parent)) {
      filteredReplaceOptions = filter(
        replaceOptions.EVENT_SUB_PROCESS_START_EVENT,
        function (replaceOption) {
          const target = replaceOption.target

          const isInterrupting = target.isInterrupting !== false

          const isInterruptingEqual = businessObject.isInterrupting === isInterrupting

          // filters elements which types and event definition are equal but have have different interrupting types
          return (
            differentType(replaceOption) || (!differentType(replaceOption) && !isInterruptingEqual)
          )
        }
      )

      return this._createEntries(target, filteredReplaceOptions)
    }

    // start events inside sub processes
    if (
      is(businessObject, 'bpmn:StartEvent') &&
      !isEventSubProcess(businessObject.$parent) &&
      is(businessObject.$parent, 'bpmn:SubProcess')
    ) {
      filteredReplaceOptions = filter(replaceOptions.START_EVENT_SUB_PROCESS, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // end events
    if (is(businessObject, 'bpmn:EndEvent')) {
      filteredReplaceOptions = filter(replaceOptions.END_EVENT, function (replaceOption) {
        const target = replaceOption.target

        // hide cancel end events outside transactions
        if (
          target.eventDefinitionType == 'bpmn:CancelEventDefinition' &&
          !is(businessObject.$parent, 'bpmn:Transaction')
        ) {
          return false
        }

        return differentType(replaceOption)
      })

      return this._createEntries(target, filteredReplaceOptions)
    }

    // boundary events
    if (is(businessObject, 'bpmn:BoundaryEvent')) {
      filteredReplaceOptions = filter(replaceOptions.BOUNDARY_EVENT, function (replaceOption) {
        const target = replaceOption.target

        if (
          target.eventDefinitionType == 'bpmn:CancelEventDefinition' &&
          !is(businessObject.attachedToRef, 'bpmn:Transaction')
        ) {
          return false
        }
        const cancelActivity = target.cancelActivity !== false

        const isCancelActivityEqual = businessObject.cancelActivity == cancelActivity

        return (
          differentType(replaceOption) || (!differentType(replaceOption) && !isCancelActivityEqual)
        )
      })

      return this._createEntries(target, filteredReplaceOptions)
    }

    // intermediate events
    if (
      is(businessObject, 'bpmn:IntermediateCatchEvent') ||
      is(businessObject, 'bpmn:IntermediateThrowEvent')
    ) {
      filteredReplaceOptions = filter(replaceOptions.INTERMEDIATE_EVENT, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // gateways
    if (is(businessObject, 'bpmn:Gateway')) {
      filteredReplaceOptions = filter(replaceOptions.GATEWAY, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // transactions
    if (is(businessObject, 'bpmn:Transaction')) {
      filteredReplaceOptions = filter(replaceOptions.TRANSACTION, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // expanded event sub processes
    if (isEventSubProcess(businessObject) && isExpanded(target)) {
      filteredReplaceOptions = filter(replaceOptions.EVENT_SUB_PROCESS, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // expanded sub processes
    if (is(businessObject, 'bpmn:SubProcess') && isExpanded(target)) {
      filteredReplaceOptions = filter(replaceOptions.SUBPROCESS_EXPANDED, differentType)

      return this._createEntries(target, filteredReplaceOptions)
    }

    // collapsed ad hoc sub processes
    if (is(businessObject, 'bpmn:AdHocSubProcess') && !isExpanded(target)) {
      filteredReplaceOptions = filter(replaceOptions.TASK, function (replaceOption) {
        const target = replaceOption.target

        const isTargetSubProcess = target.type === 'bpmn:SubProcess'

        const isTargetExpanded = target.isExpanded === true

        return isDifferentType(target) && (!isTargetSubProcess || isTargetExpanded)
      })

      return this._createEntries(target, filteredReplaceOptions)
    }

    // sequence flows
    if (is(businessObject, 'bpmn:SequenceFlow')) {
      // @ts-expect-error
      return this._createSequenceFlowEntries(target, replaceOptions.SEQUENCE_FLOW)
    }

    // flow nodes
    if (is(businessObject, 'bpmn:FlowNode')) {
      filteredReplaceOptions = filter(replaceOptions.TASK, differentType)

      // collapsed sub process cannot be replaced with itself
      if (is(businessObject, 'bpmn:SubProcess') && !isExpanded(target)) {
        filteredReplaceOptions = filter(filteredReplaceOptions, function (replaceOption) {
          return replaceOption.label !== 'Sub-process (collapsed)'
        })
      }

      return this._createEntries(target, filteredReplaceOptions)
    }

    return {}
  }
}

ReplaceMenuProvider.$inject = [
  'bpmnFactory',
  'popupMenu',
  'modeling',
  'moddle',
  'bpmnReplace',
  'rules',
  'translate',
  'moddleCopy'
]

export default ReplaceMenuProvider
