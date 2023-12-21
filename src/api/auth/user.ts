import { mockRequest, request } from '@/service'
import type { RouteRecordNormalized } from 'vue-router'
import { UserState } from '@/store/modules/user/types'

export interface LoginData {
  username: string
  password: string
}

const URL = {
  register: '/api/user/signup',
  login: '/api/user/login',
  getUserInfo: '/api/user/getUserInfo'
}

export interface LoginRes {
  accessToken: string
}
export function register(message: LoginData) {
  return request.post(URL.register, message)
}
export function login(data: LoginData) {
  return request.post<LoginRes>(URL.login, data)
}

export function logout() {
  return mockRequest.post<LoginRes>('/api/user/logout')
}

export function getUserInfo() {
  return request.get<UserState>(URL.getUserInfo)
}

export function getMenuList() {
  return mockRequest.post<RouteRecordNormalized[]>('/api/user/menu')
}
