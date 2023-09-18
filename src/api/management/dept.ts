import { request, mockRequest } from '@/service'

export function FetchAllDepts() {
  return mockRequest.get<ApiDept.DeptInstance[]>('/api/depts/getAll')
}
export function BatchRemoveByIds(list: number[]) {
  return mockRequest.delete('', { params: { list } })
}
