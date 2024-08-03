<script setup lang="ts">
  import type { PropType } from 'vue'
  import type { InitRef } from '@/components/Panel/common/types'
  import type Delta from 'quill-delta'
  import 'quill/dist/quill.snow.css'
  import Quill from 'quill'
  import { EmitterSource } from 'quill/core/emitter'

  defineOptions({ name: 'FulltextInput' })

  const $props = defineProps({
    content: {
      type: String as PropType<string>,
      default: ''
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    contentType: {
      type: String as PropType<'html' | 'text' | 'delta'>,
      default: 'html'
    }
  })
  const $emits = defineEmits(['change', 'update:content', 'textChange'])

  // 内容 HTML
  const parentEl = shallowRef<InitRef<HTMLDivElement>>()
  const toolbarEl = shallowRef<InitRef<HTMLDivElement>>()
  const editorEl = shallowRef<InitRef<HTMLDivElement>>()
  const editorRef = shallowRef<InitRef<Quill>>()

  const fullscreen = ref(false)
  const fullscreenEditorEl = shallowRef<InitRef<HTMLDivElement>>()
  const fullscreenParentEl = shallowRef<InitRef<HTMLDivElement>>()
  const fullscreenEditorRef = shallowRef<InitRef<Quill>>()
  const toggleFullscreen = () => {
    const htmlString = getHTML()
    if (fullscreen.value) {
      fullscreen.value = false
      nextTick(() => setHTML(htmlString))
      return
    }
    fullscreen.value = true
    nextTick(() => {
      if (!fullscreenEditorRef.value) {
        fullscreenEditorRef.value = initEditor(fullscreenEditorEl.value!)
      }
      setHTML(htmlString)
    })
  }

  const toolbarOptions = {
    container: [
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['direction', { align: [] }],
      ['clean'],
      ['fullscreen']
    ],
    handlers: {
      fullscreen: toggleFullscreen
    }
  }

  const initEditor = (container: HTMLDivElement) => {
    const editor = new Quill(container, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      }
    })

    // editor.on('text-change', handleTextChange)

    return editor
  }

  const getText = (index?: number, length?: number): string => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    return editor?.getText(index, length) ?? ''
  }
  const setText = (text: string, source: EmitterSource = 'api') => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    editor?.setText(text, source)
  }

  const getHTMLText = (): string => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    return editor?.root.innerText ?? ''
  }
  const getHTML = (): string => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    return editor?.root.innerHTML ?? ''
  }
  const setHTML = (html: string) => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    if (editor) editor.root.innerHTML = html
  }
  const pasteHTML = (html: string, source: EmitterSource = 'api') => {
    const editor = fullscreen.value ? fullscreenEditorRef.value : editorRef.value
    const delta = editor?.clipboard.convert(html as {})
    if (delta) editor?.setContents(delta, source)
  }

  const handleTextChange = (delta: Delta, oldContents: Delta, source: EmitterSource) => {
    // 由于频繁渲染的问题，建议手动更新绑定数据
    // updateHtmlValue()
    $emits('textChange', { delta, oldContents, source })
  }

  const updateHtmlValue = () => {
    const content = getHTMLText().trim()
    $emits('update:content', !content ? '' : getHTML())
    $emits('change', !content ? '' : getHTML())
  }

  const submitUpdateHtmlValue = () => {
    updateHtmlValue()
    fullscreen.value = false
  }

  onMounted(() => {
    editorRef.value = initEditor(editorEl.value!)
    $props.content && setHTML($props.content)
  })

  onBeforeUnmount(() => {
    editorEl.value?.remove()
    editorRef.value = undefined
    fullscreenEditorEl.value?.remove()
    fullscreenEditorRef.value = undefined
  })

  defineExpose({ getHTML, setHTML, getText, setText, pasteHTML })
</script>

<template>
  <div ref="parentEl" class="quill-editor">
    <div ref="toolbarEl" class="quill-editor_toolbar"></div>
    <div ref="editorEl" class="quill-editor_content"></div>
    <div class="quill-editor_footer">
      <slot name="footer" />
      <a-button type="primary" @click="updateHtmlValue">{{ $t('Submit') }}</a-button>
    </div>
  </div>

  <a-drawer
    v-model:visible="fullscreen"
    width="940px"
    title="邮件正文"
    :hide-cancel="true"
    :on-cancel="toggleFullscreen"
    :on-before-ok="submitUpdateHtmlValue"
  >
    <div ref="fullscreenParentEl" class="quill-editor is-fullscreen">
      <div ref="fullscreenEditorEl" class="quill-editor_content"></div>
    </div>
  </a-drawer>
</template>

<style lang="scss">
  .quill-editor {
    display: flex;
    flex-direction: column;
    min-height: 240px;
    max-height: 40vh;
    overflow: hidden;
    box-sizing: border-box;
    &.is-fullscreen {
      height: 100%;
      max-height: 100%;
    }
    .ql-toolbar {
      line-height: 22px;
    }
    .quill-editor_content {
      height: fit-content;
      flex: 1;
      overflow-y: auto;
    }
    .quill-editor_footer {
      border: 1px solid #ccc;
      border-top: none;
      padding: 4px 8px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }

    .ql-formats {
      margin-right: 0 !important;
      &::before {
        content: '';
        width: 0;
        height: 22px;
        margin: 0 6px;
        border-left: 1px solid #ececec;
        display: inline-block;
      }

      &:last-child {
        margin-left: auto;
        &::before {
          content: none;
        }
      }
    }
    .ql-fullscreen {
      margin-left: auto;
      &::after {
        content: '\e808';
        font-family: 'fontello';
      }
    }
  }
</style>
