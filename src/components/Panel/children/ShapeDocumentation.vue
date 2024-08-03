<script lang="ts" setup>
  import { ref } from 'vue'
  import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { hasProcessRef } from '@/helpers/common-helpers'
  import { getDocumentation, setDocumentation } from '@/helpers/documentation-properties'
  import { debounce } from '@/utils/debounce'

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const elDocument = ref<string>('')
  const updateElDocument = debounce({ delay: 0, trailing: true }, () => {
    setDocumentation(
      modeler!.value!,
      currentElement!.value,
      currentElement!.value.businessObject,
      elDocument.value
    )
  })

  const showProcessDocument = ref<boolean>(false)
  const processDocument = ref<string>('')
  const updateProcessDocument = debounce({ delay: 0, trailing: true }, () => {
    const process = currentElement!.value.businessObject.get('processRef')
    setDocumentation(modeler!.value!, currentElement!.value, process, processDocument.value)
  })

  function isNull(element: BpmnElement): boolean {
    if (hasProcessRef(currentElement!.value)) {
      const process = currentElement!.value.businessObject.get('processRef')
      const v = getDocumentation(process) || ''
      if (v !== '') {
        return true
      }
    }
    return false
  }

  useElementUpdateListener(() => {
    elDocument.value = getDocumentation(getBusinessObject(currentElement!.value)) || ''
    if (hasProcessRef(currentElement!.value)) {
      showProcessDocument.value = true
      const process = currentElement!.value.businessObject.get('processRef')
      processDocument.value = getDocumentation(process) || ''
    } else {
      showProcessDocument.value = false
      processDocument.value = ''
    }
  })
</script>

<template>
  <a-collapse-item name="Documentation">
    <template #header>
      <LucideIcon name="FileCog" />{{ $t('Documentation') }}
      <a-tag v-if="isNull(currentElement)" color="blue"><LucideIcon name="Pointer" /></a-tag>
    </template>
    <edit-item :label="$t('ElementDocumentation')">
      <a-textarea
        v-model="elDocument"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        @input="updateElDocument"
      />
    </edit-item>
    <edit-item v-if="showProcessDocument" :label="$t('ProcessDocumentation')">
      <a-textarea
        v-model="processDocument"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        @input="updateProcessDocument"
      />
    </edit-item>
  </a-collapse-item>
</template>
