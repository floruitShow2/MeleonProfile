<template>
  <div class="markdown-editor-wrapper">
    <div class="markdown-tools">
      <div class="tools-title">维思编辑器</div>
      <div class="tools-list">
        <div class="tools-list-item">
          <span>重置</span>
          <i class="iconfont ws-reset ibtn_mini ibtn_hover" @click="handleResetContent"></i>
        </div>
        <div class="tools-list-item">
          <span>主题</span>
          <a-select
            v-model="activeTheme"
            size="mini"
            :style="{ width: '120px' }"
            @select="handleThemeChange"
          >
            <a-option
              v-for="theme in themeList"
              :key="theme.value"
              :label="theme.label"
              :value="theme.value"
            />
          </a-select>
        </div>
      </div>
    </div>
    <Editor
      ref="editorRef"
      v-model:value="content"
      :class="['markdown-editor', `markdown-editor-${activeTheme}`]"
      :locale="zhHans"
      :plugins="plugins"
      @change="handleValueChange"
      @selection-start="handleSelection"
    />
    <div
      v-if="isPopoverShow"
      class="popover"
      :style="{
        left: positionRect.left + 10 + 'px',
        top: positionRect.top + 10 + 'px'
      }"
      @click.stop
    >
      <a-button size="mini" type="outline" @click.stop="handleSelectionBold">bold</a-button>
      <a-button size="mini" type="outline" @click.stop="handleSelectionH1">h1</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Editor } from '@bytemd/vue-next'
  import highlight from '@bytemd/plugin-highlight'
  import gfm from '@bytemd/plugin-gfm'
  import 'bytemd/dist/index.css'
  import 'juejin-markdown-themes/dist/juejin.min.css'
  import 'highlight.js/styles/monokai-sublime.css'
  import zhHans from 'bytemd/locales/zh_Hans.json'
  import MarkdownExample from './example.md?raw'

  const plugins = [highlight(), gfm()]

  const editorRef = ref<Editor>()

  // 切换主题
  const themeList = ref<Array<Record<string, string>>>([
    {
      label: '默认主题',
      value: 'default'
    },
    {
      label: 'MELEON',
      value: 'meleon'
    }
  ])
  const activeTheme = ref('default')
  const handleThemeChange = (e: string | number | Record<string, any> | undefined) => {
    if (!e) return
    activeTheme.value = e.toString()
  }

  const content = ref(MarkdownExample)

  const getEditorRange = () => {
    let range = null
    let selection = null
    if (window.getSelection) {
      selection = window.getSelection()
      if (selection && selection.getRangeAt && selection.rangeCount) {
        range = selection.getRangeAt(0)
        return {
          range,
          selection
        }
      }
      return null
    }
    return null
  }

  const isPopoverShow = ref<boolean>(false)
  const positionRect = ref<Record<string, number>>({ top: 0, left: 0, width: 0, height: 0 })
  // 用户编辑行为
  const handleValueChange = (v: string) => {
    content.value = v
  }

  // range
  const handleSelection = (e: Event) => {
    console.log('component', e)
  }

  const handleSelectionBold = () => {
    const rangeInfo = getEditorRange()
    if (!rangeInfo) return
    const { selection } = rangeInfo
    const selectedString = selection.toString()
    content.value = content.value.replace(selectedString, `**${selectedString}**`)
  }
  const handleSelectionH1 = () => {
    const rangeInfo = getEditorRange()
    if (!rangeInfo) return
    const { selection } = rangeInfo
    const selectedString = selection.toString()
    content.value = content.value.replace(selectedString, `##${selectedString}`)
  }

  // 重置内容
  const backupContent = MarkdownExample

  const handleResetContent = () => {
    content.value = backupContent
  }
</script>

<style lang="less" scoped>
  @import '@/styles/layout.less';
  @import '@/styles/theme.less';
  @import '@/components/markdownView/theme/default.less';
  @import '@/components/markdownView/theme/meleon.less';
  #base() {
    width: 100%;
    #color(background-color, --module-bg-color);
  }
  .markdown-editor-wrapper {
    position: relative;
    padding: 20px;
    width: 100%;
    height: calc(100vh - 60px);
    #flex(column, center, flex-start);
    #color(background-color, --primary-bg-color);
    .markdown-tools {
      #base();
      height: 60px;
      padding: 5px 20px;
      margin-bottom: 10px;
      #flex(row, center, space-between);
      .tools-title {
        font-size: 20px;
        font-weight: 800;
        #color(color, --primary-text-color);
      }
      .tools-list {
        #flex(row, center, flex-end);
        &-item {
          margin-left: 10px;
          #flex(column, flex-start, flex-start);
          span:first-child {
            margin-bottom: 5px;
            font-size: 12px;
            #color(color, --lighter-text-color);
          }
          span:last-child {
            font-size: 16px;
            #color(color, --primary-text-color);
          }
        }
      }
    }
    .markdown-editor {
      #base();
      height: calc(100% - 70px);
      border-right: solid 1px;
      #color(border-color, --primary-border-color);
      :deep(.bytemd) {
        height: 100%;
      }
    }
    .popover {
      position: fixed;
      top: 0;
      left: 0;
      width: 300px;
      max-height: 200px;
      padding: 5px;
      border: solid 1px;
      border-radius: 2px;
      #color(border-color, --primary-border-color);
      #color(background-color, --lighter-bg-color);
    }
  }
</style>
