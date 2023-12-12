import { defineComponent, ref, onMounted, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { LikeBlog } from '@/api/articles'
import './index.less'

export default defineComponent({
  props: {
    liked: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    collects: {
      type: Number,
      default: 0
    },
    showComments: {
      type: Boolean,
      default: false
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  emits: ['like', 'comment'],
  setup(props, { emit }) {
    const { liked, likes, showComments, comments } = toRefs(props)

    const route = useRoute()

    const articleId = ref<string>('')
    onMounted(() => {
      const { id } = route.params
      articleId.value = Array.isArray(id) ? id[0] : id
    })

    const handleLikeClick = async () => {
      await LikeBlog(articleId.value)
      emit('like')
    }

    const handleCommentsClick = () => {
      emit('comment')
    }

    return () => (
      <div class="article-tools">
        <div
          class={{
            'article-tools-item': true,
            'is-active': liked.value
          }}
        >
          <i class="iconfont ws-like-fill" onClick={handleLikeClick}></i>
          {likes.value > 0 && <span>{likes.value}</span>}
        </div>
        <div class="article-tools-item">
          <i class="iconfont ws-collect-fill"></i>
        </div>
        <div
          class={{
            'article-tools-item': true,
            'is-active': showComments.value
          }}
        >
          <i class="iconfont ws-comments-fill" onClick={handleCommentsClick}></i>
          {comments.value > 0 && <span>{comments.value}</span>}
        </div>
      </div>
    )
  }
})
