declare namespace ApiChat {
  export interface NoteType {
    noteId: string
    noteCreator: string
    noteReceiver: string
    notePublishTime: Date
    noteContent: string
  }

  export interface CommentType {
    commentId: string
    referenceId?: string
    commentContent: string
    commentPublisher: string
    commentPublishTime: Date
    commnetReceiver: string
  }

  export type MsgEnum = 'Text' | 'File' | 'Image'

  export interface TextBody {
    content: string
    replyId?: string
    /**
     * 消息链接映射
     */
    urlContentMap: Record<
      string,
      {
        title: string
        description: string
        image: string
      }
    >
  }

  export interface FileBody {
    filename: string
    size: number
    url: string
  }

  export interface ImageBody {
    url: string
  }

  export interface MsgType {
    // 消息类型枚举
    type: MsgEnum
    // 消息体
    body: TextBody | FileBody | ImageBody | any
  }

  export interface MessageEntity {
    // 消息ID
    id: string
    // 消息实体
    message: MsgType
    // 发布者
    publisher: string
    // 发布日期
    publishTime: string | number | Date
    // 加载中
    loading?: boolean
  }

  export interface RoomType {
    roomId: string
    roomName: string
    roomAvatar: string
    roomCreateTime: Date
    // 是否置顶
    isPinned: boolean
    relativeUserId: string[]
    // message list
    unreadCount: number
    messageList: CommentType[]
  }
}
