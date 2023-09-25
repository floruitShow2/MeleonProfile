import { mockRequest } from '@/service'

// export const FetchStatistics = () => {}
const URLs = {
  articles: '/api/articles/list'
}
/**
 * 文章管理
 */
export const FetchArticles = (category: string, searchQuery: string) => {
  return mockRequest.get(URLs.articles, { params: { category, searchQuery } })
}
