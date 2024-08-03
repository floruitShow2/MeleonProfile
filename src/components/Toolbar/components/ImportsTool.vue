<script lang="ts" setup>
  import { PropType, ref } from 'vue'
  import { modelerKey, processBaseKey } from '@/injection-keys'
  import Canvas from 'diagram-js/lib/core/Canvas'

  const $props = defineProps({
    resetIdWithImport: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  })

  const importRef = ref<HTMLInputElement | null>(null)
  const modeler = inject(modelerKey)
  const processBase = inject(processBaseKey)

  const regex1 =
    /process((?:[^>]*\s+[^>]*)*)id="([^"]*)"((?:[^>]*\s+[^>]*)*)name="([^"]*)"((?:[^>]*\s+[^>]*)*)\/?>/g
  const regex2 = /BPMNPlane((?:[^>]*\s+[^>]*)*)bpmnElement="([^"]*)"((?:[^>]*\s+[^>]*)*)>/g
  const regex3 = /participant((?:[^>]*\s+[^>]*)*)processRef="([^"]*)"((?:[^>]*\s+[^>]*)*)>/g

  const importXML = async (xmlStr: string) => {
    const { id, name } = processBase!.value!
    if ($props.resetIdWithImport && id && name) {
      xmlStr = xmlStr.replace(regex1, `process$1id="${id}"$3name="${name}"$5>`)
      xmlStr = xmlStr.replace(regex2, `BPMNPlane$1bpmnElement="${id}"$3>`)
      xmlStr = xmlStr.replace(regex3, `participant$1processRef="${id}"$3>`)
    }

    const { warnings } = await modeler!.value!.importXML(xmlStr)
    if (warnings) {
      for (const warn of warnings) console.warn(warn)
    }

    const canvas = modeler!.value!.get<Canvas>('canvas')
    canvas.zoom('fit-viewport')
  }

  const openImportWindow = () => {
    importRef.value && importRef.value!.click()
  }

  const changeImportFile = () => {
    if (importRef.value && importRef.value!.files) {
      const file = importRef.value!.files![0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = function () {
        const xmlStr = this.result
        importXML(xmlStr as string)
      }
      importRef.value!.value = ''
      importRef.value!.files = null
    }
  }
</script>

<template>
  <a-button type="primary" secondary @click="openImportWindow">
    <LucideIcon name="Folder" :size="16" />
    {{ $t('openFile') }}
  </a-button>
  <input
    ref="importRef"
    type="file"
    style="display: none"
    accept=".xml,.bpmn"
    @change="changeImportFile"
  />
</template>
