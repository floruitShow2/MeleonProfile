import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const DASHBOARD: AppRouteRecordRaw = {
  path: '/management',
  name: 'management',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.management',
    requiresAuth: true,
    icon: 'icon-calendar-clock',
    order: 3
  },
  children: [
    {
      path: 'task',
      name: 'management/task',
      component: () => import('@/views/management/task/index'),
      meta: {
        locale: 'menu.management.task',
        requiresAuth: true,
        roles: ['*']
      }
    },
    // 部门管理
    {
      path: 'dept',
      name: 'dept',
      component: () => import('@/views/management/dept/index.vue'),
      meta: {
        locale: 'menu.management.dept',
        requiresAuth: true,
        roles: ['*']
      }
    },
    // 角色管理
    {
      path: 'role',
      name: 'role',
      component: () => import('@/views/management/role/index.vue'),
      meta: {
        locale: 'menu.management.role',
        requiresAuth: true,
        hideInMenu: true,
        roles: ['admin']
      }
    }
  ]
}

export default DASHBOARD
