import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const Test: AppRouteRecordRaw = {
  path: '/test',
  name: 'test',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.test',
    requiresAuth: true,
    icon: 'icon-user',
    order: 12
  },
  children: [
    {
      path: '/lib',
      name: 'test/lib',
      component: () => import('@/views/test/index'),
      meta: {
        locale: 'menu.test.index',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default Test
