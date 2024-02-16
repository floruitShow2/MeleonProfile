import { defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'
import { Button } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    author: {
      type: Object as PropType<ApiAuth.UserInfo>,
      required: true
    }
  },
  setup(props) {
    const { author } = toRefs(props)
    return () => (
      <div class="markdown-author">
        {/* 文章作者基本信息 */}
        <div class="markdown-author_header">
          <div class="author-avatar">
            <img src={author.value.avatar} alt="" />
          </div>
          <div class="author-message">
            <span class="message-username">{author.value.username}</span>
            <span class="message-desc" title={`${author.value.job} | ${author.value.introduction}`}>
              {author.value.job} | {author.value.introduction}
            </span>
          </div>
        </div>
        {/* 文章作者相关计数 */}
        <ul class="markdown-author_count">
          <li class="count-item">
            <span class="count-item-num">{author.value.blogCount ?? 0}</span>
            <span class="count-item-label">文章</span>
          </li>
          <li class="count-item">
            <span class="count-item-num">{author.value.viewCount ?? 0}</span>
            <span class="count-item-label">阅读</span>
          </li>
          <li class="count-item">
            <span class="count-item-num">{author.value.likeCount ?? 0}</span>
            <span class="count-item-label">收获的赞</span>
          </li>
        </ul>
        {/* 操作按钮 */}
        <div class="markdown-author_btns">
          <Button type="primary">关注</Button>
          <Button type="secondary">私信</Button>
        </div>
      </div>
    )
  }
})
