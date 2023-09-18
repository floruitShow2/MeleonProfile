import Mock from 'mockjs'
import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

const createTaskList = (): TaskMangeUtil.TaskCard[] => {
  return Mock.mock({
    'items|10': [
      {
        id: () => faker.string.uuid(),
        title: () => faker.word.words(5),
        description: () => faker.lorem.sentence(20),
        keywords: () => faker.helpers.arrayElements(['keyword1', 'keyword2', 'keyword3']),
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
            title: 'NEW TASKS',
            tasks: createTaskList()
          },
          {
            title: 'IN PROGRESS',
            tasks: createTaskList()
          },
          {
            title: 'COMPLETED',
            tasks: createTaskList()
          },
          {
            title: 'DELAY',
            tasks: createTaskList()
          }
        ]
      }
    }
  }
]

export default apis
