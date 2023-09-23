import Mock from 'mockjs'
import type { MockMethod } from 'vite-plugin-mock'

const apis: MockMethod[] = [
  {
    url: '/mock/api/chat/list',
    method: 'get',
    response: () => {
      return {
        Code: 200,
        Message: 'ok',
        ReturnData: Mock.mock({
          'data|4-6': [
            {
              'id|+1': 1,
              username: '用户7352772',
              content: '马上就开始了，好激动！',
              time: '13:09:12',
              'isCollect|2': true
            }
          ]
        }).data
      }
    }
  }
]
export default apis
