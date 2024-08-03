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

  defineOptions({ name: 'MicroServiceTask' })

  const labelWidth = ref(100)
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const serviceId = ref<InitRef<string>>()
  const url = ref<InitRef<string>>()
  const method = ref<InitRef<string>>()
  const params = ref<InitRef<string>>()
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

  const updateServiceId = () => updateFieldElement('serviceId', serviceId.value)
  const updateUrl = () => updateFieldElement('url', url.value)
  const updateMethod = () => updateFieldElement('method', method.value)
  const updateParams = () => updateFieldElement('params', params.value)
  const updateIgnoreException = () => updateFieldElement('ignoreException', ignoreException.value)
  const updateSaveResponse = () =>
    updateFieldElement('saveResponseParameters', saveResponseParameters.value)
  // const updateVariableName = () =>
  //   updateFieldElement('responseVariableName', responseVariableName.value)

  const updateVariableName = debounce({ delay: 0, trailing: true }, () => {
    const name = 'responseVariableName'
    const value = responseVariableName.value
    const { element, modeling, bpmnModeler } = getElementAndModeling()
    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const fieldEE = fieldEEs.filter((ex) => ex.name === name)[0]
    const propName = 'string'
    if (fieldEE) {
      if (value === 'false') {
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
  })

  const resetFormState = () => {
    serviceId.value = url.value = method.value = undefined
    params.value = ignoreException.value = undefined
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
        case 'serviceId':
          serviceId.value = exEl.get('string')
          break
        case 'url':
          url.value = exEl.get('string')
          break
        case 'method':
          method.value = exEl.get('string')
          break
        case 'params':
          params.value = exEl.get('expression')
          break
        case 'ignoreException':
          ignoreException.value = exEl.get('string')
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
  <a-collapse-item key="ScServiceTask">
    <template #header>
      <BpmnIcon name="sc-service-task" :size="16" />
      {{ $t('ScServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('AppServiceId')">
      <a-input v-model="serviceId" placeholder="请输入ServiceId" @input="updateServiceId" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('Url')">
      <a-input v-model="url" placeholder="请输入URL" @input="updateUrl" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('RequestMethod')">
      <a-radio-group v-model="method" type="button" @change="updateMethod">
        <a-radio value="GET">{{ $t('Get') }}</a-radio>
        <a-radio value="POST">{{ $t('Post') }}</a-radio>
      </a-radio-group>
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('ParamsContent')">
      <HttpParamsInput v-model:value="params" @change="updateParams" />
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
      <a-input v-model="responseVariableName" @input="updateVariableName" />
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
