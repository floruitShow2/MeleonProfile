import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const MAP: AppRouteRecordRaw = {
  path: '/map',
  name: 'map',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.map',
    requiresAuth: true,
    icon: 'icon-location',
    order: 6
  },
  children: [
    {
      path: 'autoNavi',
      name: 'menu.map.autoNavi',
      component: () => import('@/views/map/autoNavi/index'),
      meta: {
        locale: 'menu.map.autoNavi',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default MAP
