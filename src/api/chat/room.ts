import { request } from '@/service'

enum URLs {
  createRoom = '/api/chat/room/createRoom',
  getRooms = '/api/chat/room/getRoomsById',
  deleteRoom = '/api/chat/room/deleteRoom'
}

export const CreateRoom = (data: ChatRoom.ChatRoomInput) => {
  return request.post(URLs.createRoom, data)
}

export const FetchRooms = () => {
  return request.get<ChatRoom.RoomEntity[]>(URLs.getRooms)
}

export const RemoveRoom = (roomId: string) => {
  return request.post(URLs.deleteRoom, { roomId })
}
