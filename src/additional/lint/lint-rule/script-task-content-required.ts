import { is } from 'bpmn-js/lib/util/ModelUtil'

export function scriptTaskContentRequired() {
  function check(nodeBo: BpmnElement, reporter: Reporter) {
    if (!nodeBo || !is(nodeBo, 'bpmn:ScriptTask')) return

    if (!nodeBo.get('script') || !nodeBo.get('scriptFormat')) {
      reporter.report(nodeBo.id, '请配置脚本格式/内容')
    }
  }

  return { check }
}
