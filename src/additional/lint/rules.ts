import { errorStartEventRequired } from './lint-rule/error-start-event-required'
import { messageStartEventRequired } from './lint-rule/message-start-event-required'
import { signalStartEventRequired } from './lint-rule/signal-start-event-required'
import { timerStartEventRequired } from './lint-rule/timer-start-event-required'
import { userTaskAssigneeRequired } from './lint-rule/user-task-assignee-required'
import { sequenceFlowConditionRequired } from './lint-rule/sequence-flow-condition-required'
import { compensateBoundaryTaskRequired } from './lint-rule/compensate-boundary-task-required'
import { serviceTaskConfigRequired } from './lint-rule/service-task-config-required'
import { scriptTaskContentRequired } from './lint-rule/script-task-content-required'
import { callActivityProcessRequired } from './lint-rule/call-activity-process-required'

export type LintRuleName = string
export type CacheLintRuleName = `bpmnlint/${LintRuleName}`
export type LintRuleFlag = 'warn' | 'error' | 'info' | 'off'

export type LintRuleLinter = () => {
  check: (node: BpmnElement, reporter: Reporter) => undefined | void
}

export type Rules = Record<LintRuleName, LintRuleFlag>

export const rules: Rules = {
  'message-start-event-required': 'error',
  'signal-start-event-required': 'error',
  'timer-start-event-required': 'error',
  'error-start-event-required': 'error',
  'user-task-assignee-required': 'error',
  'sequence-flow-condition-required': 'error',
  'compensate-boundary-task-required': 'error',
  'service-task-config-required': 'error',
  'script-task-content-required': 'error',
  'call-activity-process-required': 'error'
}

export const rulesCache: Record<CacheLintRuleName, LintRuleLinter> = {
  'bpmnlint/message-start-event-required': messageStartEventRequired,
  'bpmnlint/signal-start-event-required': signalStartEventRequired,
  'bpmnlint/timer-start-event-required': timerStartEventRequired,
  'bpmnlint/error-start-event-required': errorStartEventRequired,
  'bpmnlint/user-task-assignee-required': userTaskAssigneeRequired,
  'bpmnlint/sequence-flow-condition-required': sequenceFlowConditionRequired,
  'bpmnlint/compensate-boundary-task-required': compensateBoundaryTaskRequired,
  'bpmnlint/service-task-config-required': serviceTaskConfigRequired,
  'bpmnlint/script-task-content-required': scriptTaskContentRequired,
  'bpmnlint/call-activity-process-required': callActivityProcessRequired
}
