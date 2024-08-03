import BpmnRules from 'bpmn-js/lib/features/rules/BpmnRules'

// import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
import EventBus from 'diagram-js/lib/core/EventBus'
import { is } from 'bpmn-js/lib/util/ModelUtil'

class CustomRules extends BpmnRules {
  constructor(eventBus: EventBus) {
    super(eventBus)

    this.initCustom()
  }

  _baseCanCreate = BpmnRules.prototype.canCreate

  // @ts-expect-error
  canCreate(shape, target, source, position) {
    if (is(target, 'bpmn:Collaboration')) {
      return !target.children.length && this._baseCanCreate(shape, target, source, position)
    }
    return this._baseCanCreate(shape, target, source, position)
  }

  initCustom() {
    this.addRule('shape.create', 2000, (context) => {
      return this.canCreate(context.shape, context.target, context.source, context.position)
    })
  }
}

CustomRules.$inject = ['eventBus']

export default CustomRules
