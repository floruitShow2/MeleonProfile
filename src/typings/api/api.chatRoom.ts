declare namespace ChatRoom {

    export interface RoomEntity {
        roomId: string
        roomName: string
        roomCover: string
        // 是否置顶
        isPinned: boolean
        noDisturbing: boolean
        members: string[]
        creator?: ApiAuth.UserInfo
        createTime: Date
        messages: ApiChat.MessageEntity[]
      }

    interface ChatRoomInput {
        roomName: string
        roomCover?: string
    }
}