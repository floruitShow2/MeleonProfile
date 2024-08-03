<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { getConditionExpression, SequenceFlowType } from '@/helpers/condition-helpers'
  import { execPanelCommands, execPanelMultiCommands } from '@/utils/commandsExecute'
  import { createElement } from '@/utils/element-utils'
  import { debounce } from '@/utils/debounce'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { is } from 'bpmn-js/lib/util/ModelUtil'

  defineOptions({ name: 'SequenceFlow' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const conditionOptions: PropertyOptions = [
    { value: '', name: 'NormalSequenceFlow' },
    { value: 'default', name: 'DefaultSequenceFlow' },
    { value: 'condition', name: 'ConditionSequenceFlow' }
  ]

  const sequenceType = ref<SequenceFlowType>('')
  const conditionExpression = ref('')
  const processId = ref('')
  const defaultFlowFlag = ref(false) // 默认标识
  let expressionModdleElement: BpmnModdleEl | undefined = undefined

  const updateSequenceType = () => {
    const businessObject = currentElement!.value!.businessObject
    const commands: CommandContext[] = []
    // 1. 设置为默认流，清空条件、设置上游节点
    if (sequenceType.value === 'default') {
      commands.push(
        {
          cmd: 'element.updateModdleProperties',
          context: {
            element: currentElement!.value,
            moddleElement: businessObject,
            properties: { conditionExpression: undefined }
          }
        },
        {
          cmd: 'element.updateProperties',
          context: {
            element: currentElement!.value.source,
            properties: { default: businessObject }
          }
        }
      )
      return execPanelMultiCommands(modeler!.value!, commands)
    }
    // 2. 设置为普通流，判断上游默认节点、清空条件
    if (sequenceType.value === '') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: currentElement!.value,
          moddleElement: businessObject,
          properties: { conditionExpression: undefined }
        }
      })
      if (defaultFlowFlag.value) {
        commands.push({
          cmd: 'element.updateProperties',
          context: {
            element: currentElement!.value.source,
            properties: { default: undefined }
          }
        })
      }
      return execPanelMultiCommands(modeler!.value!, commands)
    }
    // 3. 设置为条件流，判断上游默认节点、添加空值条件
    if (defaultFlowFlag.value) {
      commands.push({
        cmd: 'element.updateProperties',
        context: {
          element: currentElement!.value.source,
          properties: { default: undefined }
        }
      })
    }
    const conditionExpression = createElement(modeler!.value!, 'bpmn:FormalExpression', {
      body: ''
    })
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element: currentElement!.value,
        moddleElement: businessObject,
        properties: { conditionExpression }
      }
    })
    return execPanelMultiCommands(modeler!.value!, commands)
  }

  const updateConditionExpression = debounce({ delay: 0, trailing: true }, () => {
    expressionModdleElement = getConditionExpression(currentElement!.value)
    execPanelCommands(modeler!.value!, {
      element: currentElement!.value,
      moddleElement: expressionModdleElement,
      properties: { body: conditionExpression.value }
    })
  })

  const initSequenceFlowData = () => {
    defaultFlowFlag.value = false
    expressionModdleElement = getConditionExpression(currentElement!.value)

    const root = modeler!.value!.get<Canvas>('canvas').getRootElement()
    if (is(root, 'bpmn:Collaboration')) {
      processId.value = root.children[0].businessObject.processRef.id
    } else {
      processId.value = root['id']
    }

    const expression = expressionModdleElement?.get('body')
    if (expression !== undefined) {
      conditionExpression.value = expression
      sequenceType.value = 'condition'
      return
    }
    conditionExpression.value = ''
    const source = (currentElement!.value as BpmnConnection).source
    if (source.businessObject.get('default') === currentElement!.value?.businessObject) {
      sequenceType.value = 'default'
      defaultFlowFlag.value = true
    } else {
      sequenceType.value = ''
    }
  }

  useElementUpdateListener(() => {
    if (!currentElement?.value) return
    initSequenceFlowData()
  })
</script>

<template>
  <a-collapse-item key="SequenceFlow">
    <template #header><LucideIcon name="MoveUpRight" />{{ $t('SequenceFlow') }}</template>
    <EditItem :label="$t('SequenceFlowType')">
      <a-radio-group v-model="sequenceType" type="button" @change="updateSequenceType">
        <a-radio v-for="i in conditionOptions" :key="i.value" :value="i.value">{{
          $t(i.name)
        }}</a-radio>
      </a-radio-group>
    </EditItem>
    <EditItem v-if="sequenceType === 'condition'" :label="$t('ConditionExpression')">
      <ConditionExpressionInput
        v-model:value="conditionExpression"
        modal-title="编辑表达式"
        :process-id="processId"
        @change="updateConditionExpression"
      />
    </EditItem>
  </a-collapse-item>
</template>
