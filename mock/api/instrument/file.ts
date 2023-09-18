import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import { faker } from '@faker-js/faker'

const creatFakeRecentFiles = (recent: number): ApiFile.RecentFileType[] => {
  return Mock.mock({
    'items|20': [
      {
        file: {
          filename: () => {
            const fakeName = () => faker.word.noun(10)
            const fakeExt = () => faker.helpers.arrayElement(['.jpg', '.pdf', '.xlsx', '.doc'])
            return `${fakeName()}${fakeExt()}`
          },
          filesize: () => faker.number.int({ min: 1024, max: 1024 * 100 })
        },
        uploader: () => faker.person.lastName(),
        uploadTime: () => faker.date.recent({ days: recent }),
        views: () => faker.number.int({ min: 1, max: 300 }),
        download: () => faker.number.int({ min: 1, max: 300 }),
        relatives: () => {
          const num = Math.floor(Math.random() * 10 + 1)
          const relatives: string[] = []
          for (let i = 0; i < num; i++) {
            relatives.push(faker.person.lastName())
          }
          return relatives
        }
      }
    ]
  }).items
}

const createFakeOperationLogs = (): ApiFile.OperationLogType[] => {
  return Mock.mock({
    'items|20': [
      {
        operator: () => faker.person.lastName(),
        operateTime: () => faker.date.recent({ days: 5 }),
        type: () => faker.helpers.arrayElement(['upload', 'delete', 'view']),
        'files|1-3': [
          {
            filename: () => {
              const fakeName = () => faker.word.noun(10)
              const fakeExt = () => faker.helpers.arrayElement(['.jpg', '.pdf', '.xlsx', '.doc'])
              return `${fakeName()}${fakeExt()}`
            },
            filesize: () => faker.number.int({ min: 1024, max: 1024 * 100 })
          }
        ]
      }
    ]
  }).items
}

const apis: MockMethod[] = [
  {
    url: '/mock/api/file/GetRecentFiles',
    timeout: 200,
    method: 'get',
    response: ({ query }): Service.MockServiceResult<ApiFile.RecentFileType[]> => {
      const { recent } = query
      return {
        Code: 1,
        Message: 'ok',
        ReturnData: creatFakeRecentFiles(recent)
      }
    }
  },
  {
    url: '/mock/api/file/GetOperationLogs',
    timeout: 200,
    method: 'get',
    response: ({ query }): Service.MockServiceResult<ApiFile.OperationLogType[]> => {
      const { warehouse } = query
      if (!warehouse) {
        return {
          Code: 1,
          Message: 'ok',
          ReturnData: []
        }
      }

      return {
        Code: 1,
        Message: 'ok',
        ReturnData: createFakeOperationLogs()
      }
    }
  }
]

export default apis
