import type { TableData } from '@arco-design/web-vue/es/table/interface'
import { mockRequest } from '@/service'

export interface ContentDataRecord {
  x: string
  y: number
}

export function queryContentData() {
  return mockRequest.get<ContentDataRecord[]>('/api/content-data')
}

export interface PopularRecord {
  key: number
  clickNumber: string
  title: string
  increases: number
}

export function queryPopularList(params: { type: string }) {
  return mockRequest.get<TableData[]>('/api/popular/list', { params })
}
