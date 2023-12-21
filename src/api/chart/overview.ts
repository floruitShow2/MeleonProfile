import { mockRequest } from '@/service'

const URLs = {
  'overview/cards': '/api/chart/getDataCards'
}

/**
 * @description 获取数据中心渲染卡片列表所需参数
 */
export const FetchDataCards = () => {
  return mockRequest.get<ApiChart.OverviewCardType[]>(URLs['overview/cards'])
}
