import { mockRequest, request } from '@/service'

// export const FetchStatistics = () => {}
const URLs = {
  articles: '/api/blog/getBlogsList',
  drafts: '/api/blog/getDraftsList',
  uploadBlogs: '/api/blog/uploadBlogs'
}

export const FetchArticleById = (id: string) => {
  return request.get<{
    articleInfo: ApiArticle.ArticleEntity
    authorInfo: ApiAuth.UserInfo
  }>(`/api/blog/${id}`)
}

/**
 * @description 文章管理-数据看板-文章管理
 * @param searchQuery 查询参数
 * @returns
 */
export const FetchArticlesList = (searchQuery: string) => {
  return request.get<ApiArticle.ArticleEntity[]>(URLs.articles, {
    params: { searchQuery }
  })
}

export const FetchDraftsList = (searchQuery: string) => {
  return request.get(URLs.drafts, { params: { searchQuery } })
}

export const UploadBlogs = (blogs: Partial<ApiArticle.ArticleEntity>[]) => {
  return request.post(URLs.uploadBlogs, { blogs })
}
