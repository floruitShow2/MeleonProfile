import { Connection, Root, Shape, Label, Parent } from 'bpmn-js/lib/model/Types'
import { ModdleElement } from 'bpmn-moddle'

declare global {
  type BpmnModdleEl = ModdleElement
  type BpmnRoot = BpmnModdleEl & Root
  type BpmnShape = BpmnModdleEl & Shape
  type BpmnConnection = BpmnModdleEl & Connection
  type BpmnLabel = BpmnModdleEl & Label
  type BpmnParent = BpmnModdleEl & Parent

  type BpmnElement = BpmnRoot | BpmnShape | BpmnConnection | BpmnLabel | BpmnParent

  type CommandContextGetter = () => Record<string, unknown>
  type CommandContext = {
    cmd: string
    context: Record<string, unknown> | CommandContextGetter
  }

  // 通用选项类型
  type OptionItem = {
    name: string
    value: string
  }
  type PropertyOptions = OptionItem[]

  // bpmn lint 相关
  type Reporter = {
    report(id: string, message: string, path?: string[] | Record<string, string[] | string>): void
  }
}
