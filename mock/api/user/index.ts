import type { MockMethod } from 'vite-plugin-mock'

const apis: MockMethod[] = [
  {
    url: '/mock/api/user/info',
    method: 'post',
    response: () => {
      // const role = window.localStorage.getItem('userRole') || 'admin'
      return {
        Code: 200,
        Message: '',
        ReturnData: {
          name: '王立群',
          avatar:
            '//lf1-xgcdn-tos.pstatp.com/obj/vcloud/vadmin/start.8e0e4855ee346a46ccff8ff3e24db27b.png',
          email: 'wangliqun@email.com',
          job: 'frontend',
          jobName: '前端艺术家',
          organization: 'Frontend',
          organizationName: '前端',
          location: 'beijing',
          locationName: '北京',
          introduction: '人潇洒，性温存',
          personalWebsite: 'https://www.arco.design',
          phone: '150****0000',
          registrationDate: '2013-05-10 12:10:00',
          accountId: '15012312300',
          certification: 1,
          role: 'admin'
        }
      }
    }
  },
  {
    url: '/mock/api/user/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      if (!username) {
        return {
          Code: 500,
          Message: '用户名不能为空',
          ReturnData: null
        }
      }
      if (!password) {
        return {
          Code: 500,
          Message: '密码不能为空',
          ReturnData: null
        }
      }
      if (username === 'admin' && password === 'admin') {
        // window.localStorage.setItem('userRole', 'admin')
        return {
          Code: 1,
          Message: '成功',
          ReturnData: {
            token: '12345'
          }
        }
      }
      if (username === 'user' && password === 'user') {
        // window.localStorage.setItem('userRole', 'user')
        return {
          Code: 1,
          Message: 'ok',
          ReturnData: {
            token: '54321'
          }
        }
      }
      return {
        Code: 500,
        Message: '账号或密码错误',
        ReturnData: null
      }
    }
  },
  {
    url: '/mock/api/user/logout',
    method: 'post',
    response: () => {
      return {
        Code: 200,
        Message: 'ok',
        ReturnData: null
      }
    }
  },
  {
    url: '/mock/api/user/menu',
    method: 'post',
    response: () => {
      const menuList = [
        {
          path: '/dashboard',
          name: 'dashboard',
          meta: {
            locale: 'menu.server.dashboard',
            requiresAuth: true,
            icon: 'icon-dashboard',
            order: 1
          },
          children: [
            {
              path: 'workplace',
              name: 'Workplace',
              meta: {
                locale: 'menu.server.workplace',
                requiresAuth: true
              }
            },
            {
              path: 'https://arco.design',
              name: 'arcoWebsite',
              meta: {
                locale: 'menu.arcoWebsite',
                requiresAuth: true
              }
            }
          ]
        }
      ]
      return {
        Code: 200,
        Message: 'ok',
        ReturnData: menuList
      }
    }
  }
]

export default apis
