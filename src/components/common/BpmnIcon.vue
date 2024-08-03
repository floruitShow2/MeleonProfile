<template>
  <svg class="bpmn-icon" aria-hidden="true" :style="computedSize">
    <use :href="`#${name}`" :fill="color" />
  </svg>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'BpmnIcon',
    inheritAttrs: true,
    props: {
      name: {
        type: String,
        default: 'bpmn-icon-process'
      },
      size: {
        type: Number,
        default: 20
      },
      color: {
        type: String,
        default: '#1d1d1f'
      }
    },
    computed: {
      computedSize() {
        return { width: `${this.size}px`, height: `${this.size}px` }
      }
    }
  })
</script>
