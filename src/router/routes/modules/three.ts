import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const THREE: AppRouteRecordRaw = {
  path: '/three',
  name: 'three',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.three',
    requiresAuth: true,
    icon: 'icon-common',
    order: 3
  },
  children: [
    {
      path: 'example',
      name: 'three/example',
      component: () => import('@/views/three/example'),
      meta: {
        locale: 'menu.three.example',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'object',
      name: 'three/object',
      component: () => import('@/views/three/object'),
      meta: {
        locale: 'menu.three.object',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'vector',
      name: 'three/vector',
      component: () => import('@/views/three/journey'),
      meta: {
        locale: 'menu.three.vector',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}
export default THREE
