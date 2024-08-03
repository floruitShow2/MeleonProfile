<script setup lang="ts">
  import type { PropType } from 'vue'

  defineOptions({ name: 'ScriptInput' })

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    language: {
      type: String as PropType<string>,
      default: 'javascript'
    }
  })
  const $emits = defineEmits(['change', 'update:value'])

  const scriptContent = ref<string>($props.value)
  const fullscreenContent = ref<string>($props.value)

  const fullscreen = ref(false)

  const openModal = () => {
    fullscreenContent.value = scriptContent.value
    fullscreen.value = true
  }
  const toggleFullscreen = () => {
    fullscreen.value = false
  }

  const submitUpdateScriptValue = () => {
    updateScriptValue()
    fullscreen.value = false
  }

  const updateScriptValue = () => {
    const value = fullscreen.value ? fullscreenContent.value : scriptContent.value
    $emits('update:value', value)
    $emits('change', value)
  }
</script>

<template>
  <div class="script-editor">
    <div class="script-editor_header">
      <div class="q-monaco-fullscreen" @click="openModal"></div>
    </div>
    <div class="script-editor_content">
      <MonacoEditor v-model:modelValue="scriptContent" :language="language" />
    </div>
    <div class="script-editor_footer">
      <slot name="footer" />
      <a-button type="primary" @click="updateScriptValue">{{ $t('Submit') }}</a-button>
    </div>
  </div>

  <a-drawer
    v-model:visible="fullscreen"
    width="940px"
    title="脚本"
    :hide-cancel="true"
    :on-cancel="toggleFullscreen"
    :on-before-ok="submitUpdateScriptValue"
  >
    <MonacoEditor v-model:modelValue="scriptContent" :language="language" />
  </a-drawer>
</template>

<style scoped lang="scss">
  .script-editor {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid #ccc;
  }
  .script-editor_header {
    display: flex;
    padding: 4px 8px;
  }
  .script-editor_footer {
    border-top: none;
    padding: 4px 8px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
  }
  .q-monaco-fullscreen {
    margin-left: auto;
    cursor: pointer;
    &::after {
      content: '\e808';
      font-family: 'fontello';
    }
  }
</style>
