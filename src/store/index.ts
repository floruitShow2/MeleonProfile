import { createPinia } from 'pinia'
import useAppStore from './modules/app'
import useUserStore from './modules/user'
import useFileStore from './modules/file'
import useTabBarStore from './modules/tab-bar'

const pinia = createPinia()

export { useAppStore, useUserStore, useFileStore, useTabBarStore }
export default pinia
