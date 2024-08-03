import { is } from 'bpmn-js/lib/util/ModelUtil'
import { getExtensionElementsList } from '@/utils/extension-elements-utils'

export function serviceTaskConfigRequired() {
  function getFields(nodeBo: BpmnModdleEl): BpmnModdleEl[] {
    return getExtensionElementsList(nodeBo, 'flowable:Field')
  }

  function validateFields(
    fields: BpmnModdleEl[],
    params: string[],
    specialProcessor: Record<string, (el: BpmnModdleEl) => boolean> = {}
  ): boolean {
    const paramsMap = params.reduce((m, cur) => {
      const [key, specialKey = 'string'] = cur.split('.')
      m[key] = specialKey
      return m
    }, {})

    const valid: boolean = true
    let len: number = params.length

    for (const field of fields) {
      const fieldName = field.get('name') as string

      if (paramsMap[fieldName]) {
        len--

        if (specialProcessor[fieldName] && !specialProcessor[fieldName](field)) {
          return false
        }

        if (!field.get(paramsMap[fieldName])) return false
      }
    }

    return len === 0 && valid
  }

  function check(nodeBo: BpmnModdleEl, reporter: Reporter) {
    if (!nodeBo || !is(nodeBo, 'bpmn:ServiceTask')) return

    const childType = nodeBo.get('type')

    if (!childType) {
      if (!nodeBo.get('class') && !nodeBo.get('expression') && !nodeBo.get('delegateExpression')) {
        reporter.report(nodeBo.id, '请配置节点类型/表达式/Java类/代理表达式')
      }
      return
    }

    const fields = getFields(nodeBo)

    switch (childType) {
      case 'sc':
        !validateFields(fields, ['serviceId', 'url', 'method']) &&
          reporter.report(nodeBo.id, '请配置服务Id/请求地址/请求方式')
        return
      case 'copy':
        !validateFields(fields, ['transferToUserNos']) &&
          reporter.report(nodeBo.id, '请配置抄送人员')
        return
      case 'rest':
        !validateFields(fields, ['requestUrl', 'requestMethod']) &&
          reporter.report(nodeBo.id, '请配置请求地址/请求方式')
        return
      case 'http':
        !validateFields(fields, ['requestUrl', 'requestMethod']) &&
          reporter.report(nodeBo.id, '请配置请求地址/请求方式')
        return
      case 'mq':
        !validateFields(fields, ['queue']) && reporter.report(nodeBo.id, '请配置队列名称')
        return
      case 'dmn':
        !validateFields(fields, ['decisionTableReferenceKey'], {
          decisionTableReferenceKey: (field) => field.get('text')
        }) && reporter.report(nodeBo.id, '请选择决策')
        return
      case 'mail':
        !validateFields(fields, ['to.expression', 'subject', 'html.expression']) &&
          reporter.report(nodeBo.id, '请配置收件人、主题、邮件内容')
        return
    }
  }

  return { check }
}
