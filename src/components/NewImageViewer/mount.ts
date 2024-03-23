import { createApp, watch } from 'vue'
import type { App, Ref } from 'vue'
import NewImageViewer from './index'
import type { ImageViewerProps } from './interface'

const showImageViewer = (app: App<Element>) => {
  // 创建文档碎片
  const dFrag = document.createElement('div')
  // 将组件挂载在文档碎片上
  const vm = app.mount(dFrag) as InstanceType<typeof NewImageViewer> & {
    visible: boolean
    show: () => void
    close: () => void
  }
  document.body.appendChild(dFrag)
  vm.show()

  watch(
    () => vm.visible,
    (newVal) => {
      if (!newVal) app.unmount()
    }
  )
}

export const initImageViewer = (config: ImageViewerProps) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(config.images)) reject()

    const newConfig: Record<string, unknown> = { ...config }
    const app = createApp(NewImageViewer, newConfig)
    showImageViewer(app)

    resolve(true)
  })
}
