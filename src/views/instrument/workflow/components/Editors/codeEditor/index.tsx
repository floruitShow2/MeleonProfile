import { defineComponent, ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import './index.less'

export default defineComponent({
  setup() {
    let editor: monaco.editor.IStandaloneCodeEditor | null = null

    const editorRef = ref()
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker(_: string, label: string) {
        if (label === 'json') {
          return new JsonWorker()
        }
        // if (label === 'css' || label === 'scss' || label === 'less') {
        //   return new CssWorker()
        // }
        // if (label === 'html' || label === 'handlebars' || label === 'razor') {
        //   return new HtmlWorker()
        // }
        // if (['typescript', 'javascript'].includes(label)) {
        //   return new TsWorker()
        // }
        return new EditorWorker()
      }
    }

    onMounted(() => {
      // 注册Groovy语言
      monaco.languages.register({
        id: 'groovy',
        extensions: ['.groovy'],
        aliases: ['Groovy']
      })

      monaco.languages.setLanguageConfiguration('groovy', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] }
        ]
      })
      const keywords = [
        'def',
        'print',
        'class',
        'new',
        'string',
        'number',
        'boolean',
        'private',
        'public'
      ]
      monaco.languages.setMonarchTokensProvider('groovy', {
        keywords,
        tokenizer: {
          root: [
            [
              /@?[a-zA-Z][\w$]*/,
              {
                cases: {
                  '@keywords': 'keyword',
                  '@default': 'variable'
                }
              }
            ],
            [/(".*?")|('.*?')/, 'string'],
            [/^\s*\/\/.*/gm, 'comment']
          ]
        }
      })
      monaco.editor.defineTheme('groovyTheme', {
        base: 'vs-dark',
        inherit: true,
        colors: {},
        rules: [
          { token: 'keyword', foreground: '#4DA6FF', fontStyle: 'bold' },
          { token: 'comment', foreground: '#69CC7F' },
          { token: 'string', foreground: '#FFB455' },
          { token: 'variable', foreground: '#92D5FF' }
        ]
      })

      editor = monaco.editor.create(editorRef.value, {
        value: 'test',
        language: 'groovy',
        theme: 'groovyTheme',
        folding: true, // 是否折叠
        foldingHighlight: true, // 折叠等高线
        foldingStrategy: 'indentation', // 折叠方式  auto | indentation
        showFoldingControls: 'always', // 是否一直显示折叠 always | mouseover
        disableLayerHinting: true, // 等宽优化
        emptySelectionClipboard: false, // 空选择剪切板
        selectionClipboard: false, // 选择剪切板
        automaticLayout: true, // 自动布局
        codeLens: false, // 代码镜头
        scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
        colorDecorators: true, // 颜色装饰器
        accessibilitySupport: 'off', // 辅助功能支持  "auto" | "off" | "on"
        lineNumbers: 'on', // 行号 取值： "on" | "off" | "relative" | "interval" | function
        lineNumbersMinChars: 5, // 行号最小字符   number
        readOnly: false // 是否只读  取值 true | false
      })
    })

    // const changeLanguage = () => {
    //   if (!editor) return
    //   const model = editor.getModel()
    //   if (!model) return
    //   monaco.editor.setModelLanguage(model, 'groovy')
    // }

    return () => <div class="ws-code-editor" ref={editorRef}></div>
  }
})
