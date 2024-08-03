<script setup lang="ts">
  import { InitRef } from '@/components/Panel/common/types'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import {
    addExtensionElements,
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'

  defineOptions({ name: 'HttpServiceTask' })

  const labelWidth = ref(146)
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const requestUrl = ref<InitRef<string>>()
  const requestMethod = ref<InitRef<string>>()
  // const requestHeaders = ref<InitRef<string>>()
  const requestHeaders = 'Content-Type: application/json' // 默认请求头
  const requestBody = ref<InitRef<string>>()
  const responseVariableName = ref<InitRef<string>>()
  const ignoreException = ref<InitRef<string>>()
  const disallowRedirects = ref<InitRef<string>>()
  const saveResponseParametersTransient = ref<InitRef<string>>()
  const saveResponseVariableAsJson = ref<InitRef<string>>()

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
      if (fieldEE) {
        updateModdleProp(modeling, element, fieldEE, 'string', value)
      } else {
        addExtensionElements(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name,
            string: value
          })
        )
      }
    }
  )

  const updateUrl = () => updateFieldElement('requestUrl', requestUrl.value)
  const updateParams = () => updateFieldElement('requestBody', requestBody.value)
  const updateIgnoreException = () => updateFieldElement('ignoreException', ignoreException.value)
  const updateVariableName = () =>
    updateFieldElement('responseVariableName', responseVariableName.value)
  const updateDisallowRedirects = () =>
    updateFieldElement('disallowRedirects', disallowRedirects.value)
  const updateResponseTransient = () =>
    updateFieldElement('saveResponseParametersTransient', saveResponseParametersTransient.value)
  const updateResponseAsJson = () =>
    updateFieldElement('saveResponseVariableAsJson', saveResponseVariableAsJson.value)

  // 更新方法时清空参数内容
  const updateRequestMethod = () => {
    const commands: CommandContext[] = []
    const { element, bpmnModeler } = getElementAndModeling()
    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const fieldRequestMethod = fieldEEs.filter((ex) => ex.name === 'requestMethod')[0]
    const fieldRequestHeaders = fieldEEs.filter((ex) => ex.name === 'requestHeaders')[0]
    if (fieldRequestMethod) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: fieldRequestMethod,
          properties: { string: requestMethod.value }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'requestMethod',
            string: requestMethod.value
          })
        )
      )
    }
    if (!fieldRequestHeaders) {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'requestHeaders',
            string: requestHeaders
          })
        )
      )
    }
    execPanelMultiCommands(bpmnModeler, commands)
  }

  const resetFormState = () => {
    requestUrl.value = requestMethod.value = undefined
    disallowRedirects.value = saveResponseParametersTransient.value = undefined
    requestBody.value = ignoreException.value = undefined
    saveResponseVariableAsJson.value = responseVariableName.value = undefined
  }
  const initElementState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    const extensionElements = getExExtensionElementsList(bo, 'Field')
    for (const exEl of extensionElements) {
      switch (exEl.name) {
        case 'requestUrl':
          requestUrl.value = exEl.get('string')
          break
        case 'requestMethod':
          requestMethod.value = exEl.get('string')
          break
        case 'requestBody':
          requestBody.value = exEl.get('string')
          break
        case 'responseVariableName':
          responseVariableName.value = exEl.get('string')
          break
        case 'ignoreException':
          ignoreException.value = exEl.get('string')
          break
        case 'disallowRedirects':
          disallowRedirects.value = exEl.get('string')
          break
        case 'saveResponseParametersTransient':
          saveResponseParametersTransient.value = exEl.get('string')
          break
        case 'saveResponseVariableAsJson':
          saveResponseVariableAsJson.value = exEl.get('string')
          break
      }
    }
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="HttpServiceTask">
    <template #header>
      <BpmnIcon name="http-service-task" :size="16" />
      {{ $t('HttpServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('RequestUrl')">
      <a-input v-model="requestUrl" placeholder="请输入URL" @input="updateUrl" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('RequestMethod')">
      <a-radio-group v-model="requestMethod" type="button" @change="updateRequestMethod">
        <a-radio value="GET">{{ $t('HttpGet') }}</a-radio>
        <a-radio value="POST">{{ $t('HttpPost') }}</a-radio>
        <a-radio value="PUT">{{ $t('HttpPut') }}</a-radio>
        <a-radio value="DELETE">{{ $t('HttpDelete') }}</a-radio>
      </a-radio-group>
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('ParamsContent')">
      <HttpParamsInput v-model:value="requestBody" @change="updateParams" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('ResponseVariableName')">
      <a-input
        v-model="responseVariableName"
        placeholder="请输入变量名"
        @input="updateVariableName"
      />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('IgnoreError')">
      <a-switch
        v-model="ignoreException"
        checked-value="true"
        unchecked-value="false"
        @change="updateIgnoreException"
      />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('DisallowRedirects')">
      <a-switch
        v-model="disallowRedirects"
        checked-value="true"
        unchecked-value="false"
        @change="updateDisallowRedirects"
      />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('SaveResponseParametersTransient')">
      <a-switch
        v-model="saveResponseParametersTransient"
        checked-value="true"
        unchecked-value="false"
        @change="updateResponseTransient"
      />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('SaveResponseVariableAsJson')">
      <a-switch
        v-model="saveResponseVariableAsJson"
        checked-value="true"
        unchecked-value="false"
        @change="updateResponseAsJson"
      />
    </EditItem>
  </a-collapse-item>
</template>
