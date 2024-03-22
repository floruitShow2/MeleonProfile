/**
 * @description 第三方授权登录
 */
import { request } from '@/service'

enum URLs {
  github = '/api/auth/github'
}

export const GithubAuth = (code: string) => {
  return request.get(URLs.github, { params: { code } })
}
