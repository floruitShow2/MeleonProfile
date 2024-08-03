<script setup lang="ts">
  import type { InitRef, MultiInstanceType } from '@/components/Panel/common/types'
  import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp } from '@/utils/modeling'
  import { createElement } from '@/utils/element-utils'
  import { getExExtensionElementsList } from '@/utils/extension-elements-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { genCuelEmpsMultiVariableStr, genFuelMultiVariableStr } from '@/api/bpmn'
  import { setModdleProperty, setExtensionItem, setBoProperty } from '@/helpers/user-task-helpers'

  defineOptions({ name: 'MultiInstance' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const labelWidth = '100px'

  const multiInsType = ref<MultiInstanceType>('None')
  const cardinality = ref<InitRef<string>>()
  const collection = ref<InitRef<string>>()
  const variable = ref<InitRef<string>>()
  const completionCondition = ref<InitRef<string>>()

  const processId = ref<InitRef<string>>()
  const modalTitle = ref<InitRef<string>>('集合变量选择器')
  const multiInstanceVariables = ref<InitRef<any[]>>()

  const hasMultiInstance = computed(() => multiInsType.value !== 'None')

  const updateMultiInstanceType = (type: MultiInstanceType) => {
    const element = currentElement!.value
    const bo = element.businessObject
    const modeling = modeler!.value!.get<Modeling>('modeling')
    if (type === 'None') {
      return updateModdleProp(modeling, element, bo, 'loopCharacteristics', undefined)
    }
    const loopCharacteristics = createElement(
      modeler!.value!,
      'bpmn:MultiInstanceLoopCharacteristics',
      {},
      bo
    )
    if (type === 'Serial') {
      loopCharacteristics.isSequential = true
    }
    return updateModdleProp(modeling, element, bo, 'loopCharacteristics', loopCharacteristics)
  }

  const updateMultiInstanceProp = debounce(
    { delay: 0, trailing: true },
    (name: string, value?: string) => {
      const element = currentElement!.value
      const loopCharacteristics = element.businessObject.get('loopCharacteristics')
      const modeling = modeler!.value!.get<Modeling>('modeling')
      return updateModdleProp(modeling, element, loopCharacteristics, name, value)
    }
  )
  const updateMultiInstanceModdle = debounce(
    { delay: 0, trailing: true },
    (name: string, value?: string) => {
      const modeling = modeler!.value!.get<Modeling>('modeling')
      const element = currentElement!.value
      const loopCharacteristics = element.businessObject.get('loopCharacteristics')
      if (!value) {
        return updateModdleProp(modeling, element, loopCharacteristics, name, undefined)
      }
      const moddleEl = loopCharacteristics.get(name)
      if (moddleEl) {
        return updateModdleProp(modeling, element, moddleEl, 'body', value)
      }
      const expression = createElement(
        modeler!.value!,
        'bpmn:FormalExpression',
        { body: value },
        loopCharacteristics
      )
      return updateModdleProp(modeling, element, loopCharacteristics, name, expression)
    }
  )

  const updateInstanceCollection = (value: string) => {
    updateMultiInstanceProp('collection', value)
  }
  const updateInstanceVariable = debounce({ delay: 0, trailing: true }, (value: string) => {
    // updateMultiInstanceProp('elementVariable', value)
    // 需要同步更新 任务分配的固定值指定
    const element = currentElement!.value
    const loopCharacteristics = element.businessObject.get('loopCharacteristics')
    const commands: CommandContext[] = [
      {
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: loopCharacteristics,
          properties: { elementVariable: value }
        }
      }
    ]

    const assigneeType = getExExtensionElementsList(element.businessObject, 'AssigneeType')?.[0]
    if (assigneeType && assigneeType.get('body') === 'static') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: element.businessObject,
          properties: { assignee: `\${${value}}` }
        }
      })
    }
    execPanelMultiCommands(modeler!.value!, commands)
  })
  const updateInstanceCardinality = (value: string) => {
    updateMultiInstanceModdle('loopCardinality', value)
  }
  const updateInstanceCondition = (value: string) => {
    updateMultiInstanceModdle('completionCondition', value)
  }

  const updateCollectionVariables = (data: any[], value?: string) => {
    const element = currentElement!.value
    const loopCharacteristics = element.businessObject.get('loopCharacteristics')
    const assigneeType = getExExtensionElementsList(element.businessObject, 'AssigneeType')?.[0]
    const commands: Array<CommandContext | undefined> = [
      setModdleProperty(element, loopCharacteristics, 'collection', value),
      setModdleProperty(element, loopCharacteristics, 'elementVariable', 'user'),
      setExtensionItem(modeler!.value!, element, 'MultiInstanceVariables', JSON.stringify(data))
    ]
    if (assigneeType && assigneeType.get('body') === 'static') {
      commands.push(setBoProperty(element, 'assignee', '${user}'))
    }
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const updateCollectionVariablesData = (data: any[]) => {
    if (!data.length) {
      return updateCollectionVariables(data)
    }
    let value: string
    if (data.every((i) => i.tabKey === 'person')) {
      value = genCuelEmpsMultiVariableStr(data.map((i) => `'${i.code}'`).toString())
    } else {
      value = genFuelMultiVariableStr(
        data.map((i) => (i.tabKey === 'person' ? i.code : i.id)).toString()
      )
    }
    updateCollectionVariables(data, value)
  }
  const updateCollectionVariablesValue = (value: string) => {
    updateCollectionVariables([], value)
  }

  const initElementState = () => {
    resetState()
    const element = currentElement?.value
    const BO = element?.businessObject
    if (!BO) return

    const root = modeler!.value!.get<Canvas>('canvas').getRootElement()
    if (is(root, 'bpmn:Collaboration')) {
      processId.value = root.children[0].businessObject.processRef.id
    } else {
      processId.value = root['id']
    }

    const multiInstanceVariablesEl = getExExtensionElementsList(BO, 'MultiInstanceVariables')?.[0]
    if (multiInstanceVariablesEl) {
      multiInstanceVariables.value = JSON.parse(multiInstanceVariablesEl.get('body') || '[]')
    }

    const loopCharacteristics = BO.get('loopCharacteristics')
    if (loopCharacteristics) {
      multiInsType.value = loopCharacteristics.get('isSequential') ? 'Serial' : 'Parallel'
      collection.value = loopCharacteristics.get('collection')
      variable.value = loopCharacteristics.get('elementVariable')
      completionCondition.value = loopCharacteristics.get('completionCondition')?.get('body')
      cardinality.value = loopCharacteristics.get('loopCardinality')?.get('body')
    }
  }
  const resetState = () => {
    multiInsType.value = 'None'
    cardinality.value = collection.value = multiInstanceVariables.value = undefined
    variable.value = completionCondition.value = undefined
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="MultiInstance">
    <template #header>
      <LucideIcon name="Rows3" />{{ $t('MultiInstance') }}
      <a-tag v-if="hasMultiInstance" color="blue"><LucideIcon name="Pointer" /></a-tag>
    </template>
    <edit-item :label="$t('MultiInstanceType')" :label-width="labelWidth">
      <a-radio-group v-model="multiInsType" type="button" @change="updateMultiInstanceType">
        <a-radio value="None">{{ $t('None') }}</a-radio>
        <a-radio value="Parallel">{{ $t('Parallel') }}</a-radio>
        <a-radio value="Serial">{{ $t('Serial') }}</a-radio>
      </a-radio-group>
    </edit-item>
    <template v-if="hasMultiInstance">
      <edit-item :label="$t('Cardinality')">
        <a-input
          v-model="cardinality"
          placeholder="请输入基数"
          @input="updateInstanceCardinality"
        />
      </edit-item>
      <edit-item :label="$t('Collection')">
        <StaticUserTagInput
          v-model:data="multiInstanceVariables"
          v-model:value="collection"
          :process-id="processId"
          :more="false"
          :modal-title="modalTitle"
          person-special
          @change-data="updateCollectionVariablesData"
          @change-value="updateCollectionVariablesValue"
        />
      </edit-item>
      <edit-item :label="$t('ElementVariable')">
        <a-input v-model="variable" placeholder="请输入元素变量" @input="updateInstanceVariable" />
      </edit-item>
      <edit-item :label="$t('CompletionCondition')">
        <a-input
          v-model="completionCondition"
          placeholder="请输入完成条件"
          @input="updateInstanceCondition"
        />
      </edit-item>
    </template>
  </a-collapse-item>
</template>
