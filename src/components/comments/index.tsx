import { defineComponent, onMounted, ref, reactive, toRefs } from 'vue'
import { Input, Message } from '@arco-design/web-vue'
import WsAvatar from '@/components/avatar/index'
import { CreateComment, FetchCommentsById, HandleLikes } from '@/api/task'
import './index.less'
import { formatTimeAgo } from '@/utils/format'

export default defineComponent({
  props: {
    target: {
      type: String
    }
  },
  setup(props) {
    const { target } = toRefs(props)

    const commentsList = ref<ApiTask.TaskCommentEntity[]>([])

    const updateCommentsList = async () => {
      if (!target.value) return
      const { data } = await FetchCommentsById(target.value)
      if (!data) return
      commentsList.value = data
    }

    onMounted(updateCommentsList)

    const comment = reactive({
      targetId: target.value ?? '',
      content: '',
      replyId: null
    })

    const handleSubmitComment = async () => {
      const { data } = await CreateComment(comment)
      if (data) {
        Message.info('评论发布成功')
        await updateCommentsList()
      } else {
        Message.error('评论发布失败')
      }

      comment.content = ''
      await updateCommentsList()
    }

    const handleLike = async (item: ApiTask.TaskCommentEntity, index: number) => {
      if (item.alreadyLike) {
        commentsList.value[index].likes--
        await HandleLikes(item.commentId, 'sub')
      } else {
        commentsList.value[index].likes++
        await HandleLikes(item.commentId, 'add')
      }
      await updateCommentsList()
    }

    return () => (
      <div class="ws-comments">
        <div class="ws-comments-list">
          {commentsList.value.map((item, index) => {
            return (
              <div class="comment">
                <div class="comment-header">
                  <WsAvatar
                    imgUrl={item.publisher.avatar}
                    shape="circle"
                    size={40}
                    background="#FFFFFF"
                  ></WsAvatar>
                  <div class="comment-header-message">
                    <span>{item.publisher.username}</span>
                    <span>{formatTimeAgo(item.publishTime)}</span>
                  </div>
                </div>
                <div class="comment-content">
                  <p>{item.content}</p>
                  <div class="comment-content-tools">
                    <div
                      class={['tool', item.alreadyLike && 'already-liked']}
                      onClick={() => handleLike(item, index)}
                    >
                      <i class="iconfont ws-like"></i>
                      {item.likes && <span>{item.likes}</span>}
                    </div>
                    <div class="tool">
                      <i class="iconfont ws-message"></i>
                      {item.replies.length !== 0 && <span>{item.replies.length}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div class="ws-comments-input">
          <Input v-model:modelValue={comment.content} size="medium" />
          <i
            class="iconfont ws-navigator ibtn_base ibtn_medium ibtn_hover"
            onClick={handleSubmitComment}
          ></i>
        </div>
      </div>
    )
  }
})
