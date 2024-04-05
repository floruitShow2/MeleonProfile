import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  setup(props, { slots }) {
    return () => (
      <div class="article-block">
        <div class="article-block-header">
          <div class="header-item">{slots.title && slots.title()}</div>
          <div class="header-item">
            <i class="iconfont ws-reset"></i>
            <span>换一换</span>
          </div>
        </div>
        <div class="article-block-content">{slots.default && slots.default()}</div>
        <div class="article-block-footer">
          <span>查看更多</span>
          <i class="iconfont ws-arrow-right"></i>
        </div>
      </div>
    )
  }
})
