<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { InitRef } from '@/components/Panel/common/types'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { getSimpleImplType, ImplementationType } from '@/utils/implementation-type-utils'

  defineOptions({ name: 'ServiceTask' })

  const labelWidth = ref(100)
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const modeling = modeler!.value!.get<Modeling>('modeling')
    return { element, modeling }
  }
  const updateCommonProp = debounce({ delay: 0, trailing: true }, (key: string, value: unknown) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, key, value, false)
  })

  const updateClass = (value: boolean) => {
    updateCommonProp('class', value)
  }
  const updateExpression = (value: boolean) => {
    updateCommonProp('expression', value)
  }
  const updateDgExpression = (value: boolean) => {
    updateCommonProp('delegateExpression', value)
  }
  const updateResultVariable = (value: boolean) => {
    updateCommonProp('resultVariable', value)
  }

  const updateNodeType = (type: ImplementationType) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProps(
      modeling,
      element,
      element.businessObject,
      { ...emptyFill, [type]: '' },
      false
    )
  }

  const nodeTypeOptions: PropertyOptions = [
    { name: 'class', value: 'class' },
    { name: 'expression', value: 'expression' },
    { name: 'delegateExpression', value: 'delegateExpression' }
  ]
  const emptyFill = {
    class: undefined,
    expression: undefined,
    delegateExpression: undefined,
    resultVariable: undefined
  }
  const implType = ref<InitRef<ImplementationType>>()
  const classValue = ref<InitRef<string>>()
  const expressionValue = ref<InitRef<string>>()
  const dgExpressionValue = ref<InitRef<string>>()
  const resultVariable = ref<InitRef<string>>()

  const initFormState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    implType.value = getSimpleImplType(bo)
    classValue.value = bo.get('class')
    expressionValue.value = bo.get('expression')
    dgExpressionValue.value = bo.get('delegateExpression')
    resultVariable.value = bo.get('resultVariable')
  }
  const resetFormState = () => {
    classValue.value = implType.value = undefined
    expressionValue.value = dgExpressionValue.value = resultVariable.value = undefined
  }
  useElementUpdateListener(initFormState)
</script>

<template>
  <a-collapse-item key="ServiceTask">
    <template #header> <LucideIcon name="Bolt" />{{ $t('ServiceTask') }} </template>

    <edit-item :label="$t('ServiceTaskNodeType')" :label-width="labelWidth">
      <a-radio-group v-model="implType" type="button" @change="updateNodeType">
        <a-radio v-for="i in nodeTypeOptions" :key="i.value" :value="i.value">{{
          $t(i.name)
        }}</a-radio>
      </a-radio-group>
    </edit-item>
    <edit-item v-if="implType === 'class'" :label="$t('Class')" :label-width="labelWidth">
      <a-textarea v-model="classValue" @input="updateClass" />
    </edit-item>
    <edit-item v-if="implType === 'expression'" :label="$t('expression')" :label-width="labelWidth">
      <a-textarea v-model="expressionValue" @input="updateExpression" />
    </edit-item>
    <edit-item
      v-if="implType === 'delegateExpression'"
      :label="$t('delegateExpression')"
      :label-width="labelWidth"
    >
      <a-textarea v-model="dgExpressionValue" @input="updateDgExpression" />
    </edit-item>
    <edit-item
      v-if="implType === 'expression'"
      :label="$t('ResultVariable')"
      :label-width="labelWidth"
    >
      <a-input v-model="resultVariable" @input="updateResultVariable" />
    </edit-item>
  </a-collapse-item>
</template>
