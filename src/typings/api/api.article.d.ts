declare namespace ApiArticle {
  interface ArticleEntity {
    blogId: string
    // 文章标题
    title: string
    // 文章简介
    description: string
    // 文章内容
    content: string
    // 上传时间【后端生成】
    uploadTime: string | Date
    // 上传用户【后端生成】
    uploader: ApiAuth.UserInfo
    // 阅读数
    views: number
    // 点赞数
    likes: number
    liked: boolean
    // 收藏数
    collects: number
    // 评论数
    comments: number
    // 封面
    cover: string
    // 标签列表
    tags: string[]
    // 文章发布状态
    status: 'notPassed' | 'inReview' | 'published'
  }
}
