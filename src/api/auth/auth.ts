import { request, mockRequest } from '@/service'

/**
 * 获取验证码
 * @param phone - 手机号
 * @returns - 返回boolean值表示是否发送成功
 */
export function fetchSmsCode(phone: string) {
  return mockRequest.post<boolean>('/getSmsCode', { phone })
}

/**
 * 登录
 * @param userName - 用户名
 * @param password - 密码
 */
// /api/Admin/Login
export function fetchLogin(userName: string, password: string) {
  return request.post<ApiAuth.Token>('/api/Admin/Login', {
    userName,
    password
  })
}

/** 获取用户信息 */
// /api/Admin/GetUserInfo
export function fetchUserInfo() {
  return request.get<{ data: ApiAuth.UserInfo }>('/api/Admin/GetUserInfo')
}

export function Logout() {
  return request.post('/api/Admin/Logout')
}

/**
 * 获取用户路由数据
 * @param userId - 用户id
 * @description 后端根据用户id查询到对应的角色类型，并将路由筛选出对应角色的路由数据返回前端
 */
export function fetchUserRoutes(userId: string) {
  return mockRequest.post<ApiRoute.Route>('/getUserRoutes', { userId })
}

/**
 * 刷新token
 * @param refreshToken
 */
export function fetchUpdateToken(refreshToken: string) {
  return mockRequest.post<ApiAuth.Token>('/updateToken', { refreshToken })
}

export function ChangePassword(req: {
  OldPassword: string
  NewPassword: string
  ConfirmPassword: string
}) {
  return request.post('/api/Account/ChangePassword', req)
}

export interface RightType {
  id: string
  right_key: string
  description: string
  right_name: string
  create_time: string
  update_time: string
}
export function FetchRights() {
  return request.get<RightType[]>('/api/Role/GetRights')
}

export interface RoleType {
  id: string
  role_name: string
  description: string
  rights: string[]
  create_time: string
  update_time: string
}
export function FetchRoles() {
  return request.get<{
    Total: number
    List: RoleType[]
  }>('/api/Role/GetRoles')
}

export function CreateRole(req: Pick<RoleType, 'id' | 'rights' | 'description' | 'role_name'>) {
  return request.post<RoleType>('/api/Role/AddRole', req)
}

export function UpdateRole(req: RoleType) {
  return request.post('/api/Role/UpdateRole', req)
}

export function DeleteRole(id: string) {
  return request.post(`/api/Role/DeleteRole/${id}`)
}
