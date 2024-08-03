<script setup lang="ts">
  import { InitRef, ScriptFormat } from '@/components/Panel/common/types'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { debounce } from '@/utils/debounce'
  import ScriptInput from '@/components/Panel/common/ScriptInput.vue'

  defineOptions({ name: 'ScriptTask' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const labelWidth = ref(80)
  const emptyScriptProps = {
    resultVariable: undefined,
    autoStoreVariables: undefined
  }

  const scriptFormat = ref<InitRef<ScriptFormat>>()
  const autoStoreVariables = ref<InitRef<boolean>>()
  const resultVariable = ref<InitRef<string>>()
  const scriptContent = ref<InitRef<string>>()

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const modeling = modeler!.value!.get<Modeling>('modeling')
    return { element, modeling }
  }
  const updateScriptCommonProp = debounce(
    { delay: 0, trailing: true },
    (key: string, value: unknown) => {
      const { element, modeling } = getElementAndModeling()
      updateModdleProp(modeling, element, element.businessObject, key, value)
    }
  )

  const updateScriptAutoStore = (value: boolean) => {
    updateScriptCommonProp('autoStoreVariables', value)
  }
  const updateScriptResultVariable = (value: string) => {
    updateScriptCommonProp('resultVariable', value)
  }
  const updateScriptContent = (value: string) => {
    updateScriptCommonProp('script', value)
  }

  const updateScriptFormat = (scriptFormat: ScriptFormat) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProps(modeling, element, element.businessObject, {
      scriptFormat,
      ...emptyScriptProps
    })
  }

  const initFormState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    scriptFormat.value = bo.get('scriptFormat')
    scriptContent.value = bo.get('script')
    resultVariable.value = bo.get('resultVariable')
    autoStoreVariables.value = bo.get('autoStoreVariables')
  }
  const resetFormState = () => {
    scriptFormat.value = autoStoreVariables.value = undefined
    resultVariable.value = scriptContent.value = undefined
  }
  useElementUpdateListener(initFormState)
</script>

<template>
  <a-collapse-item key="ScriptTask">
    <template #header> <LucideIcon name="ScrollText" />{{ $t('ScriptTask') }} </template>

    <edit-item :label="$t('ScriptFormat')" :label-width="labelWidth">
      <a-radio-group v-model="scriptFormat" type="button" @change="updateScriptFormat">
        <a-radio value="groovy">groovy</a-radio>
        <a-radio value="JavaScript">JavaScript</a-radio>
        <a-radio value="juel">juel</a-radio>
      </a-radio-group>
    </edit-item>
    <edit-item
      v-if="scriptFormat === 'groovy' || scriptFormat === 'JavaScript'"
      :label="$t('KeepResults')"
      :label-width="labelWidth"
    >
      <a-switch v-model="autoStoreVariables" @change="updateScriptAutoStore" />
    </edit-item>
    <edit-item
      v-if="scriptFormat === 'juel'"
      :label-width="labelWidth"
      :label="$t('ResultVariable')"
    >
      <a-input
        v-model="resultVariable"
        placeholder="请输入变量名"
        clearable
        @input="updateScriptResultVariable"
      />
    </edit-item>
    <edit-item :label-width="labelWidth" :label="$t('ScriptContent')">
      <!--      <a-textarea-->
      <!--        v-model="scriptContent"-->
      <!--        :autosize="{ minRows: 2, maxRows: 4 }"-->
      <!--        clearable-->
      <!--        @input="updateScriptContent"-->
      <!--      />-->
      <ScriptInput
        v-model:value="scriptContent"
        :language="scriptFormat?.toLocaleLowerCase() || 'javascript'"
        @change="updateScriptContent"
      />
    </edit-item>
  </a-collapse-item>
</template>
