import { mockRequest, request } from '@/service'
import { FileItemType } from '@/views/articles/center/components/importMenu/interface'

// export const FetchStatistics = () => {}
const URLs = {
  articles: '/api/articles/list',
  uploadBlogs: '/api/blog/uploadBlogs'
}
/**
 * 文章管理
 */
export const FetchArticles = (category: string, searchQuery: string) => {
  return mockRequest.get(URLs.articles, { params: { category, searchQuery } })
}

export const UploadBlogs = (blogs: FileItemType[]) => {
  return request.post(URLs.uploadBlogs, { blogs })
}
