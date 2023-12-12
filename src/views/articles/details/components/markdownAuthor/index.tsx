import { PropType, defineComponent, toRefs } from 'vue'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ApiAuth.UserInfo>,
      required: true
    }
  },
  setup(props) {
    const { data } = toRefs(props)
    return () => (
      <div class="markdown-author">
        <div class="markdown-author_header">
          <img src={data.value.avatar} alt="" />
          <div class="message">
            <span class="message-username">{data.value.username}</span>
          </div>
        </div>
      </div>
    )
  }
})
