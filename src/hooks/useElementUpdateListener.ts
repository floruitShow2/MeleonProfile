import { onBeforeUnmount, onBeforeMount } from 'vue'
import EventEmitter from '@/utils/EventEmitter'

type ElementListener = (element?: BpmnElement) => unknown

export default function (listener: ElementListener) {
  const thisListener = listener

  let executedFlag = false
  const changeFlag = () => {
    executedFlag = true
  }

  const removeListener = () => {
    EventEmitter.removeListener('element-update', thisListener)
    EventEmitter.removeListener('element-update', changeFlag)
  }

  onBeforeMount(() => {
    if (EventEmitter.hasListener('element-update', thisListener)) {
      return
    }
    EventEmitter.on('element-update', thisListener)
    EventEmitter.on('element-update', changeFlag)
  })

  onMounted(() => {
    !executedFlag && thisListener()
  })

  onBeforeUnmount(() => removeListener())

  return [thisListener, removeListener]
}
