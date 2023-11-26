declare namespace ApiArticle {
  interface ArticleEntity {
    id: string
    // 文章标题
    title: string
    // 文章简介
    description: string
    // 文章内容
    content: string
    // 上传时间【后端生成】
    uploadTime: string | Date
    // 上传用户【后端生成】
    uploader: string
    // 阅读数
    views: number
    // 点赞数
    likes: number
    // 封面
    cover: string
    // 标签列表
    tags: string[]
    // 文章发布状态
    status: 'notPassed' | 'inReview' | 'published'
  }
}
