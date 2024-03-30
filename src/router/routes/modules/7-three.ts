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
      name: 'menu.three.object',
      component: () => import('@/views/three/object/index'),
      meta: {
        locale: 'menu.three.object',
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: 'vector',
      name: 'menu.three.vector',
      component: () => import('@/views/three/journey/index'),
      meta: {
        locale: 'menu.three.vector',
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: 'vr',
      name: 'menu.three.vr',
      component: () => import('@/views/three/vr/index'),
      meta: {
        locale: 'menu.three.vr',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'vrHall',
      name: 'menu.three.vrHall',
      component: () => import('@/views/three/vrHall/index'),
      meta: {
        locale: 'menu.three.vrHall',
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: 'showroom',
      name: 'menu.three.showroom',
      component: () => import('@/views/three/showroom/index'),
      meta: {
        locale: 'menu.three.showroom',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}
export default THREE
