declare namespace ApiArticle {
  interface ArticleEntity {
    title: string
    description: string
    uploadTime: string | Date
    uploader: string
    views: number
    likes: number
    image: string
  }
}
