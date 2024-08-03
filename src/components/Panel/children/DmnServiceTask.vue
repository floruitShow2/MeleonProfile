<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { InitRef } from '@/components/Panel/common/types'
  import {
    addExtensionElements,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProps } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'

  defineOptions({ name: 'DmnServiceTask' })
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
    (name: string, props: Record<string, unknown>) => {
      const { element, modeling, bpmnModeler } = getElementAndModeling()
      const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
      const fieldEE = fieldEEs.filter((ex) => ex.name === name)[0]
      if (fieldEE) {
        updateModdleProps(modeling, element, fieldEE, props)
      } else {
        addExtensionElements(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name,
            ...props
          })
        )
      }
    }
  )

  const decisionTableReferenceKey = ref<InitRef<string>>()
  const fallbackToDefaultTenant = ref<InitRef<string>>()
  const decisionTaskThrowErrorOnNoHits = ref<InitRef<string>>()

  const mockDecisionTableRefKey = ref<any[]>([])

  const updateDecisionTableRef = () => {
    const dmn = mockDecisionTableRefKey.value[0]
    updateFieldElement('decisionTableReferenceKey', {
      string: dmn?.modelKey,
      text: dmn?.name
    })
  }
  const updateFallbackToDefaultTenant = () => {
    updateFieldElement('fallbackToDefaultTenant', { string: fallbackToDefaultTenant.value })
  }
  const updateThrowErrorOnNoHits = () => {
    updateFieldElement('decisionTaskThrowErrorOnNoHits', {
      string: decisionTaskThrowErrorOnNoHits.value
    })
  }

  const initElementState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    const extensionElements = getExExtensionElementsList(bo, 'Field')

    for (const exEl of extensionElements) {
      switch (exEl.name) {
        case 'decisionTableReferenceKey':
          const modelKey = exEl.get('string')
          const name = exEl.get('text')
          decisionTableReferenceKey.value = exEl.get('string')
          mockDecisionTableRefKey.value = modelKey ? [{ modelKey, name }] : []
          break
        case 'fallbackToDefaultTenant':
          fallbackToDefaultTenant.value = exEl.get('string')
          break
        case 'decisionTaskThrowErrorOnNoHits':
          decisionTaskThrowErrorOnNoHits.value = exEl.get('string')
          break
      }
    }
  }
  const resetFormState = () => {
    decisionTableReferenceKey.value =
      fallbackToDefaultTenant.value =
      decisionTaskThrowErrorOnNoHits.value =
        undefined
    mockDecisionTableRefKey.value = []
  }
  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="DmnServiceTask">
    <template #header>
      <BpmnIcon name="dmn-service-task" :size="16" />
      {{ $t('DmnServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('SelectDmn')">
      <DmnTagInput
        v-model:data="mockDecisionTableRefKey"
        :multiple="false"
        @change="updateDecisionTableRef"
      />
    </EditItem>
    <EditItem :label-width="240" :label="$t('FallbackToDefaultTenantDmn')">
      <a-switch
        v-model="fallbackToDefaultTenant"
        checked-value="true"
        unchecked-value="false"
        @change="updateFallbackToDefaultTenant"
      />
    </EditItem>
    <EditItem :label-width="240" :label="$t('DecisionTaskThrowErrorOnNoHitsDmn')">
      <a-switch
        v-model="decisionTaskThrowErrorOnNoHits"
        checked-value="true"
        unchecked-value="false"
        @change="updateThrowErrorOnNoHits"
      />
    </EditItem>
  </a-collapse-item>
</template>
