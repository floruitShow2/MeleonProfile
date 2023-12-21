import { MockMethod } from 'vite-plugin-mock'

const apis: MockMethod[] = [
  {
    url: '/mock/api/articles/list',
    method: 'get',
    response: ({ query }) => {
      const { category, searchQuery } = query
      return {
        Code: 1,
        Message: category + searchQuery,
        ReturnData: []
      }
    }
  }
]

export default apis
