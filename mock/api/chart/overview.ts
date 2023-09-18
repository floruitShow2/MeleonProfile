import Mock from 'mockjs'
import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

const createFakerCards = () => {
  return Mock.mock({
    'items|8': [
      {
        label: () => faker.word.noun({ length: { min: 5, max: 8 } }),
        data: () => faker.number.float({ min: 156, max: 200, precision: 0.01 }),
        unit: () => faker.word.noun({ length: { min: 1, max: 3 } }),
        rate: () => faker.number.float({ min: -1, max: 1, precision: 0.001 })
      }
    ]
  }).items
}

const apis: MockMethod[] = [
  {
    url: '/mock/api/chart/getDataCards',
    method: 'get',
    response: (): Service.MockServiceResult<ApiChart.OverviewCardType[]> => {
      return {
        Code: 1,
        Message: 'OK',
        ReturnData: createFakerCards()
      }
    }
  }
]

export default apis
