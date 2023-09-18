import type { InjectionKey } from 'vue'

export interface MessageContext {
  roomId: string
  messageList: ApiChat.MessageEntity[]
}

const messageInjectionKey: InjectionKey<MessageContext> = Symbol('WsChatMessage')

export { messageInjectionKey }
