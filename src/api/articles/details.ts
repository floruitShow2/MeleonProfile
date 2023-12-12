import { request } from '@/service'

// export const FetchStatistics = () => {}
const URLs = {
  like: '/api/blog/like'
}

export function LikeBlog(blogId: string) {
  return request.post(URLs.like, { blogId })
}
