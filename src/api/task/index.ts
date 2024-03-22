import { mockRequest, request } from '@/service'

enum URLs {
  'getAll' = '/api/task/getAllTasks',
  'create' = '/api/task/createTask',
  'update' = '/api/task/updateTask',
  // 任务封面
  'addCover' = '/api/task/addCover',
  'deleteCover' = '/api/task/deleteCover',
  // 任务评论
  'createComment' = '/api/comment/createComment',
  'removeComment' = '/api/comment/removeComment',
  'getComments' = '/api/comment/getCommentsById',
  // 点赞
  'addLikes' = '/api/comment/addLikes'
}

/**
 * @description 获取所有任务
 * @param options
 * @returns
 */
export const FetchAllTasks = (options: ApiTask.SearchOptions) => {
  return request.get<Array<{ group: string; list: ApiTask.TaskEntity[] }>>(URLs.getAll, {
    params: options
  })
}

/**
 * @description 创建新任务
 * @param data
 * @returns
 */
export const CreateTask = (data: FormData) => {
  return request.post(URLs.create, data)
}

/**
 * @description 更新任务信息
 * @param taskId 任务ID
 * @param taskEntity 更新后的任务信息
 * @returns
 */
export const UpdateTask = (taskId: string, taskEntity: Partial<ApiTask.TaskEntity>) => {
  return request.post(URLs.update, { taskId, taskEntity })
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

/**
 * @description 删除用户发布的评论
 * @param commentId 评论ID
 * @returns
 */
export const RemoveComment = (commentId: string) => {
  return request.post(URLs.removeComment, { commentId })
}

/**
 * @description 点赞 或 取消点赞
 * @param commentId 评论ID
 * @param type 判断 点赞 或 取消点赞
 * @returns
 */
export const HandleLikes = (commentId: string, type: 'add' | 'sub') => {
  return request.post(URLs.addLikes, { commentId, type })
}

/**
 * @description 添加封面
 * @param data: FormData
 * @returns
 */
export const AddCover = (data: FormData) => {
  return request.post<string>(URLs.addCover, data)
}

/**
 * @description 删除封面
 * @param taskId 任务ID
 * @returns
 */
export const DeleteCover = (taskId: string) => {
  return request.post(URLs.deleteCover, { taskId })
}
