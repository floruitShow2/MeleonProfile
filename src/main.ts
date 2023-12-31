import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import globalComponents from '@/components/index'
import VueGridLayout from 'vue-grid-layout'
import mitt from 'mitt'
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

const app = createApp(App)

app.use(ArcoVue, {})
app.use(ArcoVueIcon)

app.use(router)
app.use(store)
app.use(i18n)
app.use(VueGridLayout as any)
app.use(globalComponents)
app.use(directive)

app.config.globalProperties.$bus = mitt()
app.config.warnHandler = () => null

app.mount('#app')
