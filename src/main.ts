import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import globalComponents from '@/components/index'
import VueGridLayout from 'vue-grid-layout'
import mitt from 'mitt'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'

// bpmn 设计器国际化相关配置，如果本身项目有国际化配置，需要进行相应合并
import bpmnI18n from '@/i18n'

// 代码高亮组件及配置
import hljsVuePlugin from '@highlightjs/vue-plugin'

// shared 中的公共组件（目前只有 monaco editor），非 pnpm workspace 模式，需要修改 @flowable-designer/shared 为相应路径
import FL from '@/shared/components'

import router from './router'
import store from './store'
import i18n from './locale'
import directive from './directive'
// import './mock'
import '@amap/amap-jsapi-types'
import App from './App.vue'
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/assets/style/global.less'
import '@/styles/button.mixin.less'
import '@/styles/transition.less'

// arco design 组件库样式
import '@arco-design/web-vue/dist/arco.css'
// 代码高亮样式
import 'highlight.js/styles/stackoverflow-light.css'
// bpmn 设计器相关样式（如果修改了目录，这里需要做对应修改）
import '@/assets/styles/index.scss'
import 'virtual:svg-icons-register'

hljs.registerLanguage('xml', xml)

// eslint-disable-next-line
// @ts-ignore: worker
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (['javascript'].includes(label)) {
      return new TsWorker()
    }
    return new EditorWorker()
  }
}

const app = createApp(App)

app.use(ArcoVue, {
  componentPrefix: 'arco'
})
app.use(ArcoVueIcon)

app.use(bpmnI18n)
app.use(hljsVuePlugin)

app.use(FL)

app.use(router)
app.use(store)
app.use(i18n)
app.use(VueGridLayout as any)
app.use(globalComponents)
app.use(directive)

app.config.globalProperties.$bus = mitt()
app.config.warnHandler = () => null

app.mount('#app')
