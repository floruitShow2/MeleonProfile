import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import { formatToDate } from '@/utils/format'
import './index.less'

export default defineComponent({
  props: {
    article: {
      type: Object as PropType<ApiArticle.ArticleEntity>,
      required: true
    },
    author: {
      type: Object as PropType<ApiAuth.UserInfo>,
      required: true
    }
  },
  setup(props) {
    const { article, author } = toRefs(props)

    return () => (
      <div class="markdown-header">
        <h1 class="markdown-header-title">{article.value.title}</h1>
        <div class="markdown-header-details">
          <span class="details-author">{author.value.username}</span>
          <ul class="details-list">
            <li class="details-list-item">
              <span>{formatToDate(article.value.uploadTime, 'YYYY-MM-DD')}</span>
            </li>
            <li class="details-list-item">
              <i class="iconfont ws-view"></i>
              <span>{article.value.views}</span>
            </li>
            <li class="details-list-item">
              <i class="iconfont ws-calc"></i>
              <span>{article.value.content.length}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
})
