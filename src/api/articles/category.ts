import { mockRequest } from '@/service'

export const FetchCategory = () => {
  return mockRequest.get<string[]>('/api/art/getCategory')
}

export const FetchArticlesByCategory = (category: string) => {
  return mockRequest.get<ApiArticle.ArticleEntity[]>('/api/art/getArticles', {
    params: { category }
  })
}

export const FetchArticleRankList = (type: string, page: number, pageSize: number) => {
  return mockRequest.get<ApiArticle.ArticleEntity[]>('/api/art/getArticleRankList', {
    params: {
      type,
      page,
      pageSize
    }
  })
}
