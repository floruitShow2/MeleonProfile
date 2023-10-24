import Mock from 'mockjs'
import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

const createTaskList = (): TaskMangeUtil.TaskCard[] => {
  return Mock.mock({
    'items|10': [
      {
        id: () => faker.string.uuid(),
        title: () => faker.word.words(2),
        description: () => faker.lorem.sentence(10),
        keywords: () => faker.helpers.arrayElements(['tag1', 'tag2', 'tag3']),
        relatives: () => {
          const users: string[] = []
          for (let i = 0; i < 5; i++) {
            users.push(faker.person.lastName())
          }
          return users
        },
        reports: () => faker.number.int(10)
      }
    ]
  }).items
}

const apis: MockMethod[] = [
  {
    url: '/mock/api/task/GetTaskList',
    method: 'get',
    response: (): Service.MockServiceResult<
      Array<{ title: string; tasks: TaskMangeUtil.TaskCard[] }>
    > => {
      return {
        Code: 1,
        Message: 'OK',
        ReturnData: [
          {
            title: '要做的事',
            tasks: createTaskList()
          },
          {
            title: '进展中',
            tasks: createTaskList()
          },
          {
            title: '回顾中',
            tasks: createTaskList()
          },
          {
            title: '排期中',
            tasks: createTaskList()
          }
        ]
      }
    }
  }
]

export default apis
