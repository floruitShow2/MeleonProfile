import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import { Tag } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    article: {
      type: Object as PropType<ApiArticle.ArticleEntity>,
      required: true
    }
  },
  setup(props) {
    const { article } = toRefs(props)

    return () => (
      <div class="markdown-footer">
        <div class="markdown-footer-tags">
          <span class="tags-title">标签:</span>
          <ul class="tags-list">
            {article.value.tags.map((tag) => (
              <Tag>{tag}</Tag>
            ))}
          </ul>
        </div>
      </div>
    )
  }
})
