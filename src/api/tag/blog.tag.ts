import { request } from '@/service'

const URL = {
  blogTag: '/api/tag/getBlogTags'
}

export interface BlogTagType {
  tagName: string
  color: string
  icon: string
}

export function getBlogTags() {
  return request.get<BlogTagType[]>(URL.blogTag)
}
