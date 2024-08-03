<script setup lang="ts">
  import { InitRef } from '@/components/Panel/common/types'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import {
    addExtensionElements,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'

  defineOptions({ name: 'RestServiceTask' })

  const labelWidth = ref(100)
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const requestUrl = ref<InitRef<string>>()
  const requestMethod = ref<InitRef<string>>()
  const requestHeaders = ref<InitRef<string>>()
  const requestBody = ref<InitRef<string>>()
  const ignoreException = ref<InitRef<string>>()
  const saveResponseParameters = ref<InitRef<string>>()
  const responseVariableName = ref<InitRef<string>>()

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
      const propName = name === 'requestBody' ? 'expression' : 'string'
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

  const updateUrl = () => updateFieldElement('requestUrl', requestUrl.value)
  const updateMethod = () => updateFieldElement('requestMethod', requestMethod.value)
  const updateRequestHeaders = () => updateFieldElement('requestHeaders', requestHeaders.value)
  const updateParams = () => updateFieldElement('requestBody', requestBody.value)
  const updateIgnoreException = () => updateFieldElement('ignoreException', ignoreException.value)
  const updateSaveResponse = () =>
    updateFieldElement('saveResponseParameters', saveResponseParameters.value)
  const updateVariableName = () =>
    updateFieldElement('responseVariableName', responseVariableName.value)

  const resetFormState = () => {
    requestUrl.value = requestMethod.value = undefined
    requestBody.value = ignoreException.value = requestHeaders.value = undefined
    saveResponseParameters.value = responseVariableName.value = undefined
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
          requestBody.value = exEl.get('expression')
          break
        case 'ignoreException':
          ignoreException.value = exEl.get('string')
          break
        case 'requestHeaders':
          requestHeaders.value = exEl.get('string')
          break
        case 'saveResponseParameters':
          saveResponseParameters.value = exEl.get('string')
          break
        case 'responseVariableName':
          responseVariableName.value = exEl.get('string')
          break
      }
    }
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="RestServiceTask">
    <template #header>
      <BpmnIcon name="rest-service-task" :size="16" />
      {{ $t('RestServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('RequestUrl')">
      <a-input v-model="requestUrl" placeholder="请输入URL" @input="updateUrl" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('RequestMethod')">
      <a-radio-group v-model="requestMethod" type="button" @change="updateMethod">
        <a-radio value="GET">{{ $t('Get') }}</a-radio>
        <a-radio value="POST">{{ $t('Post') }}</a-radio>
      </a-radio-group>
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('RequestHeaders')">
      <a-input v-model="requestHeaders" placeholder="请输入头信息" @input="updateRequestHeaders" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('ParamsContent')">
      <HttpParamsInput v-model:value="requestBody" @change="updateParams" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('SaveResponseParameters')">
      <a-switch
        v-model="saveResponseParameters"
        checked-value="true"
        unchecked-value="false"
        @change="updateSaveResponse"
      />
    </EditItem>
    <EditItem
      v-if="saveResponseParameters === 'true'"
      :label-width="labelWidth"
      :label="$t('ResponseVariableName')"
    >
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
  </a-collapse-item>
</template>
