import { isUserTaskSupported } from '@/utils/element-supported'

export function userTaskAssigneeRequired() {
  function check(nodeBo: BpmnElement, reporter: Reporter) {
    if (!nodeBo || !isUserTaskSupported(nodeBo)) return

    if (
      !nodeBo.get('assignee') &&
      !nodeBo.get('candidateUsers') &&
      !nodeBo.get('candidateGroups')
    ) {
      reporter.report(nodeBo.id, '请配置审批人或候选人/组')
    }
  }

  return { check }
}
