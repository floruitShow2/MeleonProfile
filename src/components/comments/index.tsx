import { defineComponent, onMounted, ref, reactive, toRefs } from 'vue'
import { Input, Message, Popover } from '@arco-design/web-vue'
import WsAvatar from '@/components/avatar/index'
import { CreateComment, FetchCommentsById, HandleLikes, RemoveComment } from '@/api/task'
import './index.less'
import { formatTimeAgo } from '@/utils/format'

export default defineComponent({
  props: {
    target: {
      type: String
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { target } = toRefs(props)

    const commentsList = ref<ApiTask.TaskCommentEntity[]>([])

    const updateCommentsList = async () => {
      if (!target.value) return
      const { data } = await FetchCommentsById(target.value)
      if (!data) return
      commentsList.value = data
    }

    onMounted(updateCommentsList)

    const comment = reactive<{
      targetId: string
      content: string
      replyId: string | null
    }>({
      targetId: target.value ?? '',
      content: '',
      replyId: null
    })

    // 点赞功能
    const handleLike = async (item: ApiTask.TaskCommentEntity) => {
      if (item.alreadyLike) {
        // commentsList.value[index].likes--
        await HandleLikes(item.commentId, 'sub')
      } else {
        // commentsList.value[index].likes++
        await HandleLikes(item.commentId, 'add')
      }
      await updateCommentsList()
    }

    // 回复功能
    const inputRef = ref()
    const replyTarget = ref<ApiTask.TaskCommentEntity | null>()
    const handleReplies = (item: ApiTask.TaskCommentEntity) => {
      // startReply.value = true
      replyTarget.value = item
      comment.replyId = item.commentId
      inputRef.value?.focus()
    }

    const handleSubmitComment = async () => {
      if (!comment.content) return
      const { data } = await CreateComment(comment)
      if (data) {
        Message.info('评论发布成功')
        await updateCommentsList()
      } else {
        Message.error('评论发布失败')
      }

      comment.content = ''
      comment.replyId = null
      replyTarget.value = null
      await updateCommentsList()
      emit('update')
    }

    const handleRemoveClick = async (commentId: string) => {
      const { data } = await RemoveComment(commentId)
      if (data) {
        Message.info('删除成功')
        await updateCommentsList()
        emit('update')
      } else {
        Message.error('删除失败')
      }
    }

    const genCommentItem = (item: ApiTask.TaskCommentEntity) => {
      return (
        <div class={['comment', item.replyId && 'is-reply']}>
          <div class="comment-header">
            <WsAvatar
              imgUrl={item.publisher.avatar}
              shape="circle"
              size={32}
              background="#FFFFFF"
            ></WsAvatar>
            <div class="comment-header-message">
              <span>{item.publisher.username}</span>
              <span>{formatTimeAgo(item.publishTime)}</span>
            </div>
            <div class="comment-header-more">
              <Popover
                trigger="click"
                position="right"
                contentClass="comment-popover-menu"
                v-slots={{
                  content: () => (
                    <ul class="comment-popover-menu-wrapper">
                      <li onClick={() => handleRemoveClick(item.commentId)}>删除</li>
                    </ul>
                  )
                }}
              >
                <i class="iconfont ws-more ibtn_base ibtn_hover"></i>
              </Popover>
            </div>
          </div>
          <div class="comment-content">
            {/* 评论内容 */}
            <p>
              {item.replyUser && <span class="at-label">@{item.replyUser}</span>}
              {item.content}
            </p>
            {/* 评论相关操作按钮 */}
            <div class="comment-content-tools">
              <div
                class={['tool', item.alreadyLike && 'already-liked']}
                onClick={() => handleLike(item)}
              >
                <i class="iconfont ws-like"></i>
                {item.likes !== 0 && <span>{item.likes}</span>}
              </div>
              <div class="tool" onClick={() => handleReplies(item)}>
                <i class="iconfont ws-message"></i>
                {item.replies && item.replies.length !== 0 && <span>{item.replies.length}</span>}
              </div>
            </div>
          </div>
          {!item.replyId && item.replies && item.replies.length > 0 && (
            <div class="comment-replies">{item.replies.map(genCommentItem)}</div>
          )}
        </div>
      )
    }

    return () => (
      <div class="ws-comments">
        <div class="ws-comments-list">
          {commentsList.value.map((item) => {
            return <>{genCommentItem(item)}</>
          })}
        </div>
        <div class="ws-comments-input">
          {/* {replyTarget.value && (
            <div class="reply-wrapper">
              <span>{`@${replyTarget.value.publisher.username}`}</span>
              <span>{replyTarget.value.content}</span>
            </div>
          )} */}
          <Input
            v-model:modelValue={comment.content}
            ref={inputRef}
            placeholder={
              replyTarget.value ? `回复 @${replyTarget.value.publisher.username}：` : '请输入'
            }
            size="large"
            v-slots={{
              suffix: () => <i class="iconfont ws-navigator"></i>
            }}
            onPressEnter={handleSubmitComment}
          />
        </div>
      </div>
    )
  }
})
