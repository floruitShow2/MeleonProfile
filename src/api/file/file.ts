import { mockRequest, request } from '@/service'

const URLs = {
  recent: '/api/file/GetRecentFiles',
  logs: '/api/file/GetOperationLogs',
  stream: '/api/blog/getStreamFile'
}

/**
 *
 * @param recent 天数
 * @returns 最近 { recent } 天内的文件数量
 */
export const FetchRecentFiles = (recent: number) => {
  return mockRequest.get<ApiFile.RecentFileType[]>(URLs.recent, { params: { recent } })
}

/**
 *
 * @param warehouse 仓库的 ID
 * @returns 操作日志数组
 */
export const FetchOperationLogs = (warehouse: string) => {
  return mockRequest.get<ApiFile.OperationLogType[]>(URLs.logs, { params: { warehouse } })
}

export const FetchStreamFile = () => {
  return request.get<Blob>(URLs.stream, { responseType: 'blob' })
}
