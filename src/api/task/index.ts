import { mockRequest, request } from '@/service'

enum URLs {
  'getAll' = '/api/task/getAllTasks',
  'create' = '/api/task/createTask',
  // 任务评论
  'createComment' = '/api/comment/createComment',
  'getComments' = '/api/comment/getCommentsById',
  'addLikes' = '/api/comment/addLikes'
}

export const FetchAllTasks = () => {
  return request.get<Array<{ group: string; list: ApiTask.TaskEntity[] }>>(URLs.getAll)
}

export const CreateTask = (data: FormData) => {
  return request.post(URLs.create, data)
}

export const FetchCommentsById = (targetId: string) => {
  return request.get<ApiTask.TaskCommentEntity[]>(URLs.getComments, { params: { targetId } })
}

export const CreateComment = (comment: {
  targetId: string
  content: string
  replyId: string | null
}) => {
  return request.post(URLs.createComment, comment)
}

export const HandleLikes = (commentId: string, type: 'add' | 'sub') => {
  return request.post(URLs.addLikes, { commentId, type })
}
