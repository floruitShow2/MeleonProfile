import { mockRequest } from '@/service'

export interface MessageRecord {
  id: number
  type: string
  title: string
  subTitle: string
  avatar?: string
  content: string
  time: string
  status: 0 | 1
  messageType?: number
}
export type MessageListType = MessageRecord[]

export function queryMessageList() {
  return mockRequest.post<MessageListType>('/api/message/list')
}

interface MessageStatus {
  ids: number[]
}

export function setMessageStatus(data: MessageStatus) {
  return mockRequest.post<MessageListType>('/api/message/read', data)
}

export interface ChatRecord {
  id: number
  username: string
  content: string
  time: string
  isCollect: boolean
}

export function queryChatList() {
  return mockRequest.get<ChatRecord[]>('/api/chat/list')
}
