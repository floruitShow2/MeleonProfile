import { getCurrentInstance } from 'vue'
import { Emitter, EventType } from 'mitt'

export const useBus: () => Emitter<Record<EventType, unknown>> = () => {
  return getCurrentInstance()?.appContext.config.globalProperties.$bus
}

export const useInstance = () => {
  return getCurrentInstance()?.appContext.config.globalProperties
}

export const useAvatar = () => {
  return new URL(
    `../assets/avatar/avatar_${Math.floor(Math.random() * 5) + 1}.png`,
    import.meta.url
  ).href
}
