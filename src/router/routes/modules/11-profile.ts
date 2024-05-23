import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const Profile: AppRouteRecordRaw = {
  path: '/profile',
  name: 'profile',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.profile',
    requiresAuth: true,
    icon: 'icon-user',
    order: 11
  },
  children: [
    {
      path: 'overview',
      name: 'articles/overview',
      component: () => import('@/views/account/overview/index'),
      meta: {
        locale: 'menu.articles.overview',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'settings',
      name: 'menu.profile.settings',
      component: () => import('@/views/account/settings/index'),
      meta: {
        locale: 'menu.profile.settings',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default Profile
