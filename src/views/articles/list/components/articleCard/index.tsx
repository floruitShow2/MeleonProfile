import { defineComponent } from 'vue'
import { formatToDateTime } from '@/utils/format'
import './index.less'

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'vertical'
    },
    details: {
      type: Object,
      default: () => {
        return {
          title: '',
          description: '',
          uploadTime: '',
          uploader: '',
          views: 0,
          likes: 0
        }
      }
    }
  },
  setup(props, { slots }) {
    const details = props.details as ApiArticle.ArticleEntity
    return () => (
      <div
        class={{
          'ws-article-card': true,
          'is-horizontal': props.type === 'horizontal'
        }}
      >
        <div class="art-image">{slots.image && slots.image()}</div>
        <div class="art-details">
          <h4>{details.title}</h4>
          <div class="art-details-item">
            <span>
              <i class="iconfont ws-clock" />
              {formatToDateTime(details.uploadTime)}
            </span>
            <span>
              <i class="iconfont ws-user" />
              {props.details.uploader}
            </span>
          </div>
          <p>{props.details.description}</p>
          <div class="art-details-footer">
            <div class="art-nums">
              <span>
                <i class="iconfont ws-view" />
                {props.details.views}
              </span>
              <span>
                <i class="iconfont ws-like" />
                {props.details.likes}
              </span>
            </div>
            <div class="art-button">查看详情</div>
          </div>
        </div>
      </div>
    )
  }
})
