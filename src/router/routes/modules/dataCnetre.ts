import { DEFAULT_LAYOUT } from '../base'
import { AppRouteRecordRaw } from '../types'

const DataCentre: AppRouteRecordRaw = {
  path: '/datacentre',
  name: 'datacentre',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.datacentre',
    requiresAuth: true,
    icon: 'icon-branch',
    order: 4
  },
  children: [
    {
      path: 'overview',
      name: 'datacentre/overview',
      component: () => import('@/views/datacentre/overview/index'),
      meta: {
        locale: 'menu.datacentre.overview',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
}

export default DataCentre
