// 后端接口返回的数据类型
declare namespace DevResTemplate {
  interface ResTemplate<T> {
    Code: string | number
    Message: string
    ReturnData: T
  }
}

/** 后端返回的用户权益相关类型 */
declare namespace ApiAuth {
  export type RoleType = '' | '*' | 'admin' | 'user'
  /** 返回的用户信息 */
  export interface UserInfo {
    username?: string
    avatar?: string
    job?: string
    organization?: string
    location?: string
    email?: string
    introduction?: string
    personalWebsite?: string
    jobName?: string
    organizationName?: string
    locationName?: string
    phone?: string
    registrationDate?: string
    accountId?: string
    certification?: number
    role: RoleType
  }
}

/** 后端返回的路由相关类型 */
declare namespace ApiRoute {
  /** 后端返回的路由数据类型 */
  interface Route {
    /** 动态路由 */
    routes: AuthRoute.Route[]
    /** 路由首页对应的key */
    home: AuthRoute.AllRouteKey
  }
}

declare namespace ApiUserManagement {
  interface User {
    /** 用户id */
    id: string
    /** 用户名 */
    userName: string
    /** 用户年龄 */
    age: number | null
    /**
     * 用户性别
     * - 0: 女
     * - 1: 男
     */
    gender: '0' | '1' | null
    /** 用户手机号码 */
    phone: string
    /** 用户邮箱 */
    email: string | null
    /**
     * 用户状态
     * - 1: 启用
     * - 2: 禁用
     * - 3: 冻结
     * - 4: 软删除
     */
    userStatus: '1' | '2' | '3' | '4' | null
  }
}
