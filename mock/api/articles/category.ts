import Mock from 'mockjs'
import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

const fakeCategory: string[] = ['recommand', 'recent']

const createFakeArticles = () => {
  const obj: Record<string, ApiArticle.ArticleEntity[]> = {}
  fakeCategory.forEach((cate) => {
    obj[cate] = Mock.mock({
      'items|10000': [
        {
          title: () => faker.lorem.sentence({ min: 5, max: 8 }),
          description: () => faker.lorem.sentence(),
          uploader: () => faker.person.lastName(),
          uploadTime: () => faker.date.recent({ days: 10 }),
          views: () => faker.number.int({ max: 300 }),
          likes: () => faker.number.int({ max: 150 }),
          cover: () => faker.image.url()
        }
      ]
    }).items
  })
  return obj
}

const fakeRankList = ['day', 'week', 'month', 'total']
const createFakeRankList = () => {
  const obj: Record<string, ApiArticle.ArticleEntity[]> = {}
  fakeRankList.forEach((cate) => {
    obj[cate] = Mock.mock({
      'items|25': [
        {
          title: () => faker.lorem.sentence({ min: 5, max: 8 }),
          description: () => faker.lorem.sentence(),
          uploader: () => faker.person.lastName(),
          uploadTime: () => faker.date.recent({ days: 10 }),
          views: () => faker.number.int({ max: 300 }),
          likes: () => faker.number.int({ max: 150 }),
          cover: () => faker.image.url()
        }
      ]
    }).items
  })
  return obj
}

const apis: MockMethod[] = [
  {
    url: '/mock/api/art/getCategory',
    method: 'get',
    response: (): Service.MockServiceResult<string[]> => {
      return {
        Code: 1,
        Message: '获取成功',
        ReturnData: fakeCategory
      }
    }
  },
  {
    url: '/mock/api/art/getArticles',
    method: 'get',
    response: ({ query }): Service.MockServiceResult<ApiArticle.ArticleEntity[]> => {
      const { category } = query
      return {
        Code: 1,
        Message: '',
        ReturnData: createFakeArticles()[category] || []
      }
    }
  },
  {
    url: '/mock/api/art/getArticleRankList',
    method: 'get',
    response: ({ query }): Service.MockServiceResult<ApiArticle.ArticleEntity[]> => {
      const { type = 'day', page, pageSize } = query
      return {
        Code: 1,
        Message: '获取成功',
        ReturnData: createFakeRankList()[type].slice((page - 1) * pageSize, page * pageSize) || []
      }
    }
  }
]

export default apis
