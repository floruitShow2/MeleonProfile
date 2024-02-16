import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const DASHBOARD: AppRouteRecordRaw = {
  path: '/instrument',
  name: 'instrument',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.instrument',
    requiresAuth: true,
    icon: 'icon-tool',
    order: 1
  },
  children: [
    {
      path: 'chat',
      name: 'chat',
      component: () => import('@/views/instrument/chat/index'),
      meta: {
        locale: 'menu.instrument.chat',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'workflow',
      name: 'workflow',
      component: () => import('@/views/instrument/workflow/index'),
      meta: {
        locale: 'menu.instrument.workflow',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default DASHBOARD
