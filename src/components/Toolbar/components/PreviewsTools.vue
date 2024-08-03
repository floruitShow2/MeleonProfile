<script lang="ts" setup>
  import { ref } from 'vue'
  import { modelerKey } from '@/injection-keys'

  const modeler = inject(modelerKey)

  const xmlModelVisible = ref<boolean>(false)
  const xmlString = ref<string>('')

  const openXMLPreviewModel = async () => {
    try {
      xmlModelVisible.value = true

      const { xml } = await modeler!.value!.saveXML({ format: true, preamble: true })
      xmlString.value = xml || ''
    } catch (e) {
      console.error(e)
    }
  }
</script>

<template>
  <a-button type="primary" secondary @click="openXMLPreviewModel">
    <LucideIcon name="Eye" :size="16" />
    {{ $t('previewAsXML') }}
  </a-button>

  <a-modal v-model:visible="xmlModelVisible" :footer="null" :title="$t('previewAs')" width="64vw">
    <div class="preview-model">
      <highlightjs language="xml" :code="xmlString" />
    </div>
  </a-modal>
</template>
