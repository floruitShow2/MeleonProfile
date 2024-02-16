import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const FILE: AppRouteRecordRaw = {
  path: '/file',
  name: 'file',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.file',
    requiresAuth: true,
    icon: 'icon-file',
    order: 5
  },
  children: [
    {
      path: 'overview',
      name: 'file/overview',
      component: () => import('@/views/file/overview'),
      meta: {
        locale: 'menu.file.overview',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'warehouse',
      name: 'file/warehouse',
      component: () => import('@/views/file/warehouses'),
      meta: {
        locale: 'menu.file.warehouses',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default FILE
