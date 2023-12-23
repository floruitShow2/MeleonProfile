declare namespace ApiTask {
  export interface TagType {
    label: string
    code: string
    type: 'primary' | 'danger' | 'success' | 'secondary' | 'warning'
    icon: string
  }

  export interface TaskEntity {
    // 分组
    group: TaskGroups
    // 任务名
    title: string
    // 任务ID
    taskId?: string
    // 任务描述
    desc: string
    priority: 0 | 1
    // 封面
    coverImage: string
    // 开始时间
    startTime: string
    // 结束时间
    endTime: string
    // 任务标签
    tags: TagType[]
    // 任务创建人
    creator?: string
    // 任务创建时间
    createTime?: string
    // 上次更新时间
    lastUpdateTime?: string
    // 关联人
    relatives: Array<string | ApiAuth.UserInfo>
    // 附件
    attachments?: string[]
    // 评论数量
    comments: number
  }

  export interface TaskCommentEntity {
    commentId: string
    content: string
    likes: number
    alreadyLike: boolean
    publishTime: string
    publisher: {
      avatar: string
      username: string
    }
    replyId: string | null
    replyUser: string | null
    replies: TaskCommentEntity[]
    targetId: string
  }

  export interface SearchOptions {
    title: string
    tags: Array<TagType['code']>
    startDate: string
    endDate: string
  }
}
