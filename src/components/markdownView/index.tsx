import { defineComponent, ref, toRefs, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import MarkdownItAnchor from 'markdown-it-anchor'
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
    }).use(MarkdownItAnchor, {
      level: 1,
      uniqueSlugStartIndex: 1,
      slugify: (s) => s
    })

    // 获取标题列表
    function getHeadings(
      markdown: string
    ): Array<{ tag: string; tagIndex: number; level: number; content: string }> {
      const tokens = md.parse(markdown, {})

      const headings = tokens
        .filter((token) => token.type === 'heading_open')
        .map((token) => {
          const inlineToken = tokens[tokens.indexOf(token) + 1]
          return {
            level: 0,
            tag: token.tag,
            tagIndex: +token.tag[1],
            content: inlineToken.content
          }
        })

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i]
        let level = 0
        const prevHeading = headings[i - 1]
        if (prevHeading) {
          const { tagIndex: prevTagIndex, level: prevLevel } = prevHeading
          const { tagIndex: curTagIndex } = heading
          if (prevTagIndex === curTagIndex) level = prevLevel
          else if (prevTagIndex > curTagIndex) level = prevLevel - 1
          else level = prevLevel + 1
        }

        heading.level = level
      }

      return headings
    }

    const mdViewRef = ref()

    const headings = computed(() => {
      return getHeadings(modelValue.value)
    })

    expose({
      headings,
      viewRef: computed(() => mdViewRef.value)
    })

    return () => (
      <div ref={mdViewRef} class={['ml-markdown-view', `markdown-editor-${theme.value}`]}>
        <div class="markdown-body" v-html={md.render(modelValue.value, {})}></div>
      </div>
    )
  }
})
