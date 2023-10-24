import { request } from '@/service'

enum URLs {
  'create' = '/api/task/createTask'
}

export const CreateTask = (data: FormData) => {
  return request.post(URLs.create, data)
}
