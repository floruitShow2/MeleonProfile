<script setup lang="ts">
  import SaveTool from '@/components/Toolbar/components/SaveTool.vue'
  import ImportsTool from '@/components/Toolbar/components/ImportsTool.vue'
  import ExportsTools from '@/components/Toolbar/components/ExportsTools.vue'
  import PreviewsTools from '@/components/Toolbar/components/PreviewsTools.vue'
  import MocksTools from '@/components/Toolbar/components/MocksTools.vue'
  import AlignsTools from '@/components/Toolbar/components/AlignsTools.vue'
  import ScalesTools from '@/components/Toolbar/components/ScalesTools.vue'
  import CommandsTools from '@/components/Toolbar/components/CommandsTools.vue'
  import { PropType } from 'vue'

  defineProps({
    useSave: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    resetIdWithImport: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  })
</script>

<template>
  <a-config-provider size="mini">
    <div class="bpmn-toolbar">
      <a-button-group>
        <save-tool v-if="useSave" />
        <imports-tool :reset-id-with-import="resetIdWithImport" />
        <exports-tools />
        <previews-tools />
        <mocks-tools />
      </a-button-group>
      <aligns-tools />
      <scales-tools />
      <commands-tools />
      <slot></slot>
    </div>
  </a-config-provider>
</template>
