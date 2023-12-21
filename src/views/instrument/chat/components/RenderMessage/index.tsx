import { defineComponent, defineAsyncComponent, h, resolveComponent } from 'vue'
import type { Component, PropType } from 'vue'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob('./**/**.tsx')
const modules: Record<string, Component> = {}
Object.keys(ms).forEach((key) => {
  const marker = key.split('/')[1]
  modules[marker] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    ...modules
  },
  props: {
    message: {
      type: Object as PropType<ApiChat.MsgType>,
      required: true
    }
  },
  setup(props) {
    return () => h(resolveComponent(props.message.type), { body: props.message.body })
  }
})
