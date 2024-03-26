import { mockRequest, request } from '@/service'
import type { RouteRecordNormalized } from 'vue-router'

export interface LoginData {
  username: string
  password: string
}

const URL = {
  register: '/api/user/signup',
  login: '/api/user/login',
  getUserInfo: '/api/user/getUserInfo',
  updateUserInfo: '/api/user/updateUserInfo',
  updateUserAvatar: '/api/user/updateUserAvatar',
  updatePwd: '/api/user/updatePassword',
  fillPwd: '/api/user/fillPassword'
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
  return request.get<ApiAuth.UserInfo>(URL.getUserInfo)
}

export function updateUserInfo(data: Partial<ApiAuth.UserInfo>) {
  return request.post<{ accessToken: string }>(URL.updateUserInfo, data)
}

export function updateUserAvatar(data: FormData) {
  return request.post(URL.updateUserAvatar, data)
}

export function updatePassword(pwds: ApiAuth.PasswordsType) {
  return request.post(URL.updatePwd, pwds)
}

export function fillPassword(userId: string, password: string) {
  return request.post<{ accessToken: string }>(URL.fillPwd, { userId, password })
}

export function getMenuList() {
  return mockRequest.post<RouteRecordNormalized[]>('/api/user/menu')
}
