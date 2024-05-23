import Mock from 'mockjs'
import { MockMethod } from 'vite-plugin-mock'
import { faker } from '@faker-js/faker'

export function createFakeContactNotes(): ApiChat.NoteType[] {
  return Mock.mock({
    'items|10': [
      {
        'nodeId|+1': 1,
        noteCreator: () => faker.person.fullName(),
        noteReceiver: () => faker.person.fullName(),
        notePublishTime: () => faker.date.past({ years: 2, refDate: new Date().toISOString() }),
        noteContent: '@sentence(10, 20)'
      }
    ]
  }).items
}
export function createFakeComments(): ChatRoom.RoomEntity {
  return {
    roomId: (Math.random() * 5).toString(),
    roomName: faker.person.jobDescriptor(),
    roomCover: faker.image.avatar(),
    createTime: faker.date.recent({ days: 30 }),
    isPinned: faker.helpers.arrayElement([true, false]),
    noDisturbing: false,
    members: faker.helpers.arrayElements(['admin', 'meleon', 'visitor']),
    messages: []
  }
}

export function createFakeFollowees(): ApiUserManagement.User[] {
  return Mock.mock({
    'items|30': [
      {
        id: () => faker.string.uuid(),
        userName: () => faker.person.lastName(),
        age: () => faker.number.int({ min: 18, max: 40 }),
        gender: faker.helpers.arrayElement(['0', '1']),
        phone: () => faker.phone.number(),
        email: () => faker.internet.email(),
        userStatus: () => faker.helpers.arrayElement(['1', '2', '3', '4'])
      }
    ]
  }).items
}

export default [
  {
    url: '/mock/api/contact/GetChatRooms',
    method: 'get',
    response: () => {
      return {
        Code: 1,
        Message: 'ok',
        ReturnData: new Array(20).fill('').map(createFakeComments)
      }
    }
  },
  {
    url: '/mock/api/contact/GetNotes',
    method: 'get',
    response: () => {
      return {
        Code: 1,
        Message: 'ok',
        ReturnData: createFakeContactNotes()
      }
    }
  },
  {
    url: '/mock/api/contact/GetComments',
    timeout: 1,
    method: 'get',
    response: (): Service.MockServiceResult<ApiChat.MessageEntity[]> => {
      // 根据前端传来的两个用户id查询到对应的 roomid 及其中记载的聊天记录
      return {
        Code: 1,
        Message: 'ok',
        ReturnData: createFakeComments().messages
      }
    }
  },
  // 获取指定用户关注的用户列表
  {
    url: '/mock/api/contact/GetFollowee',
    method: 'get',
    response: (): Service.MockServiceResult<ApiUserManagement.User[]> => {
      return {
        Code: 1,
        Message: '关注列表获取成功',
        ReturnData: createFakeFollowees()
      }
    }
  }
] as MockMethod[]
