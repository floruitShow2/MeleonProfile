<script setup lang="ts">
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { ComponentInstance } from 'vue'
  import { CalledElementType, InitRef } from '@/components/Panel/common/types'
  import ParamsInput from '@/components/Panel/common/IoParamsInput.vue'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp } from '@/utils/modeling'
  import {
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import { createExElement } from '@/utils/element-utils'
  import CalledProcessTagInput from '@/components/Panel/common/CalledProcessTagInput.vue'

  defineOptions({ name: 'CallActivity' })
  const labelWidth = 120

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const modeling = modeler!.value!.get<Modeling>('modeling')
    return { element, modeling }
  }
  const updateCommonProp = debounce({ delay: 0, trailing: true }, (key: string, value: unknown) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, key, value)
  })

  const updateProcessInstanceName = debounce({ delay: 0, trailing: true }, (value: string) => {
    updateCommonProp('processInstanceName', value)
  })
  // const updateCalledElementType = (value: string) => {
  //   updateCommonProp('calledElementType', value)
  // }
  // const updateCalledElement = (value: string) => {
  //   updateCommonProp('calledElement', value)
  // }
  const updateInheritVariables = (value: boolean) => {
    updateCommonProp('inheritVariables', value)
  }

  const updateModelExtension = () => {
    const element = currentElement!.value
    const bo = element!.businessObject
    const calledProcess = modelBpmnExtension.value?.[0]
    const commands: Array<CommandContext | undefined> = [
      {
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: bo,
          properties: {
            calledElementType: calledProcess ? 'key' : undefined,
            calledElement: calledProcess?.modelKey,
            processInstanceName: calledProcess?.name
          }
        }
      }
    ]
    const modelExtension = getExExtensionElementsList(bo, 'ModelBpmnExtension')?.[0]
    const properties = { body: JSON.stringify(modelBpmnExtension.value) }
    if (modelExtension) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: modelExtension,
          properties
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          modeler!.value!,
          element,
          bo,
          createExElement(modeler!.value!, 'ModelBpmnExtension', properties)
        )
      )
    }
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const processInstanceName = ref<InitRef<string>>()
  const calledElementType = ref<InitRef<CalledElementType>>()
  const calledElement = ref<InitRef<string>>()
  const inheritVariables = ref<InitRef<boolean>>()
  const modelBpmnExtension = ref<any[]>([])

  const inputRef = shallowRef<InitRef<ComponentInstance<typeof ParamsInput>>>()
  const outputRef = shallowRef<InitRef<ComponentInstance<typeof ParamsInput>>>()

  const initFormState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    processInstanceName.value = bo.get('processInstanceName')
    calledElementType.value = bo.get('calledElementType')
    calledElement.value = bo.get('calledElement')
    inheritVariables.value = bo.get('inheritVariables')

    const modelExtension = getExExtensionElementsList(bo, 'ModelBpmnExtension')?.[0]
    if (modelExtension) {
      modelBpmnExtension.value = JSON.parse(modelExtension.get('body') || '[]')
    }

    inputRef.value?.initParamsList()
    outputRef.value?.initParamsList()
  }
  const resetFormState = () => {
    processInstanceName.value = calledElement.value = undefined
    calledElementType.value = inheritVariables.value = undefined
    modelBpmnExtension.value = []
  }

  useElementUpdateListener(initFormState)
</script>

<template>
  <a-collapse-item key="CallActivity">
    <template #header><LucideIcon name="GitFork" />{{ $t('CallActivity') }}</template>
    <edit-item :label-width="labelWidth" :label="$t('InstanceName')">
      <a-input
        v-model="processInstanceName"
        placeholder="请输入实例名称"
        @input="updateProcessInstanceName"
      />
    </edit-item>
    <edit-item :label-width="labelWidth" :label="$t('CalledInstance')">
      <CalledProcessTagInput
        v-model:data="modelBpmnExtension"
        :multiple="false"
        @change="updateModelExtension"
      />
    </edit-item>
    <edit-item :label-width="labelWidth" :label="$t('InheritVariables')">
      <a-switch v-model="inheritVariables" @change="updateInheritVariables" />
    </edit-item>

    <a-divider margin="4" />
    <ParamsInput ref="inputRef" :label="$t('InputParams')" type="In" />
    <a-divider margin="4" />
    <ParamsInput ref="outputRef" :label="$t('OutputParams')" type="Out" />
  </a-collapse-item>
</template>
