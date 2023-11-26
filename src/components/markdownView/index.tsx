import { defineComponent, toRefs, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import 'juejin-markdown-themes/dist/juejin.min.css'
import 'highlight.js/styles/monokai-sublime.css'
import './index.less'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'default'
    }
  },
  setup(props, { expose }) {
    const { modelValue, theme } = toRefs(props)
    const md = new MarkdownIt({
      highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value
          } catch {
            return ''
          }
        }
        return '' // 使用这个函数来避免未指定语言的代码块
      }
    }).use(markdownItTocAndAnchor, {
      toc: true,
      tocFirstLevel: 1,
      tocLastLevel: 6,
      anchorLink: true
    })

    function getHeadings(markdown: string): string[] {
      const tokens = md.parse(markdown, {})

      const headings = tokens
        .filter((token) => token.type === 'heading_open')
        .map((token) => {
          const inlineToken = tokens[tokens.indexOf(token) + 1]
          return inlineToken.content
        })

      return headings
    }

    const headings = computed(() => {
      return getHeadings(modelValue.value)
    })

    expose({ headings })

    return () => (
      <div class={['ml-markdown-view', `markdown-editor-${theme.value}`]}>
        <div class="markdown-body" v-html={md.render(modelValue.value, {})}></div>
      </div>
    )
  }
})
