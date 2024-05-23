import { mockRequest } from '@/service'

const URL = {
  note: '/api/contact/GetNotes',
  rooms: '/api/contact/GetChatRooms',
  comments: '/api/contact/GetComments',
  followee: '/api/contact/GetFollowee'
}

/**
 * @description 获取留言列表
 * @returns
 */
export function GetNotes() {
  return mockRequest.get<ApiChat.NoteType[]>(URL.note)
}

/**
 * @description 获取聊天室列表
 * @returns
 */
export function GetRooms() {
  return mockRequest.get<ChatRoom.RoomEntity[]>(URL.rooms)
}

/**
 * @description 根据房间 id 查询其中的消息列表
 */
export function GetComments(roomid: string) {
  return mockRequest.get<ApiChat.CommentType[]>(URL.comments, { params: { id: roomid } })
}

export function FetchFolloweeList(userId: string) {
  return mockRequest.get<ApiUserManagement.User[]>(URL.followee, { params: { userId } })
}
