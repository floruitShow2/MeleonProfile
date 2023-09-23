import { mockRequest } from '@/service'
import type { RouteRecordNormalized } from 'vue-router'
import { UserState } from '@/store/modules/user/types'

export interface LoginData {
  username: string
  password: string
}

export interface LoginRes {
  token: string
}
export function login(data: LoginData) {
  return mockRequest.post<LoginRes>('/api/user/login', data)
}

export function logout() {
  return mockRequest.post<LoginRes>('/api/user/logout')
}

export function getUserInfo() {
  return mockRequest.post<UserState>('/api/user/info')
}

export function getMenuList() {
  return mockRequest.post<RouteRecordNormalized[]>('/api/user/menu')
}
