<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { InitRef } from '@/components/Panel/common/types'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import {
    addExtensionElements,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'

  defineOptions({ name: 'MessageServiceTask' })
  const labelWidth = ref(80)

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const bpmnModeler = modeler!.value!
    const modeling = bpmnModeler.get<Modeling>('modeling')
    return { element, modeling, bpmnModeler }
  }
  const updateFieldElement = debounce(
    { delay: 0, trailing: true },
    (name: string, value?: string) => {
      const { element, modeling, bpmnModeler } = getElementAndModeling()
      const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
      const fieldEE = fieldEEs.filter((ex) => ex.name === name)[0]
      const propName = name === 'params' ? 'expression' : 'string'
      if (fieldEE) {
        if (name === 'saveResponseParameters' && value === 'false') {
          return updateModdleProps(modeling, element, fieldEE, {
            [propName]: value,
            responseVariableName: undefined
          })
        }
        updateModdleProp(modeling, element, fieldEE, propName, value)
      } else {
        addExtensionElements(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name,
            [propName]: value
          })
        )
      }
    }
  )

  const queue = ref<InitRef<string>>()
  const params = ref<InitRef<string>>()

  const updateQueue = () => updateFieldElement('queue', queue.value)
  const updateParams = () => updateFieldElement('params', params.value)

  const initElementState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    const extensionElements = getExExtensionElementsList(bo, 'Field')
    for (const exEl of extensionElements) {
      switch (exEl.name) {
        case 'queue':
          queue.value = exEl.get('string')
          break
        case 'params':
          params.value = exEl.get('expression')
          break
      }
    }
  }
  const resetFormState = () => {
    queue.value = params.value = undefined
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="MqServiceTask">
    <template #header>
      <BpmnIcon name="mq-service-task" :size="16" />
      {{ $t('MqServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('QueueName')">
      <a-input v-model="queue" placeholder="请输入队列名" @input="updateQueue" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('ParamsContent')">
      <HttpParamsInput v-model:value="params" @change="updateParams" />
    </EditItem>
  </a-collapse-item>
</template>
