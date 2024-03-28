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
    order: 7
  },
  children: [
    {
      path: 'example',
      name: 'menu.three.example',
      component: () => import('@/views/three/example/index'),
      meta: {
        locale: 'menu.three.example',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'object',
      name: 'three/object',
      component: () => import('@/views/three/object/index'),
      meta: {
        locale: 'menu.three.object',
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: 'vector',
      name: 'three/vector',
      component: () => import('@/views/three/journey/index'),
      meta: {
        locale: 'menu.three.vector',
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: 'vr',
      name: 'three/vr',
      component: () => import('@/views/three/vr/index'),
      meta: {
        locale: 'menu.three.vr',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'vrHall',
      name: 'three/vrHall',
      component: () => import('@/views/three/vrHall/index'),
      meta: {
        locale: 'menu.three.vrHall',
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ]
}
export default THREE
