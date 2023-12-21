const folderCover = new URL('@/assets/images/contact_bg.jpg', import.meta.url).href

const MockMessageList: ApiChat.MessageEntity[] = [
  {
    id: '1',
    publisher: 'Aliee',
    publishTime: '2023-8-30 11:28:30',
    message: {
      type: 'Text',
      body: {
        content: '第一条文本消息'
      } as ApiChat.TextBody
    }
  },
  {
    id: '2',
    publisher: 'Meleon',
    publishTime: '2023-8-30 11:30:20',
    message: {
      type: 'Text',
      body: {
        content: '这是一条回复消息',
        replyId: '1'
      } as ApiChat.TextBody
    }
  },
  {
    id: '3',
    publisher: 'Admin',
    publishTime: '2023-8-30 13:00:20',
    message: {
      type: 'File',
      body: {
        filename: 'filename.pdf',
        size: 16892,
        url: ''
      } as ApiChat.FileBody
    }
  },
  {
    id: '4',
    publisher: 'Meleon',
    publishTime: '2023-8-30 13:23:20',
    message: {
      type: 'Image',
      body: {
        url: folderCover
      } as ApiChat.ImageBody
    }
  }
]
export { MockMessageList }
