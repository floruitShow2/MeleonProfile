import { getCurrentInstance } from 'vue'
import { Emitter, EventType } from 'mitt'

export const useBus: () => Emitter<Record<EventType, unknown>> = () => {
  return getCurrentInstance()?.appContext.config.globalProperties.$bus
}
