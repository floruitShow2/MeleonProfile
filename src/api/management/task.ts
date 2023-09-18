import { request, mockRequest } from '@/service'

export function FetchAllTasks() {
  return mockRequest.get<Array<{ title: string; tasks: TaskMangeUtil.TaskCard[] }>>(
    '/api/task/GetTaskList'
  )
}
