import localeMessageBox from '@/components/message-box/locale/en-US'
import localeLogin from '@/views/login/locale/en-US'

// dashboard
import localeWorkplace from '@/views/dashboard/workplace/locale/en-US'
import localeMonitor from '@/views/dashboard/monitor/locale/en-US'

// instrument
import localeWorkflow from '@/views/instrument/workflow/locale/en-US'

// exception
import locale403 from '@/views/exception/403/locale/en-US'
import locale404 from '@/views/exception/404/locale/en-US'
import locale500 from '@/views/exception/500/locale/en-US'

// system management
import localeManagement from '@/views/management/dept/locale/en-US'

// 个人中心
import localeProfileSettings from '@/views/account/settings/locale/en-US'
import localeBasicSettings from '@/views/account/settings/components/BasicSetting/locale/en-US'
import localeSecuritySettings from '@/views/account/settings/components/SecuritySetting/locale/en-US'

import localeSettings from './en-US/settings'

export default {
  // Dashboard
  'menu.dashboard': 'Dashboard',
  'menu.server.dashboard': 'Dashboard-Server',
  'menu.server.workplace': 'Workplace-Server',
  'menu.server.monitor': 'Monitor-Server',
  // Instrument
  'menu.instrument': 'Tools',
  'menu.instrument.chat': 'Chat',
  'menu.instrument.file': 'File',
  'menu.instrument.workflow': 'Workflow',
  // Articles
  'menu.articles': 'Articles',
  'menu.articles.overview': 'Overview',
  'menu.articles.list': 'List',
  'menu.articles.editor': 'Editor',
  // Threejs
  'menu.three': 'Three',
  'menu.three.object': 'Object',
  'menu.three.vector': 'Vector',
  'menu.three.example': 'Example',
  'menu.three.vr': 'VR',
  'menu.three.vrHall': 'VRHall',
  'menu.three.showroom': 'ShowRoom',
  // Data Center
  'menu.datacentre': 'DataCentre',
  'menu.datacentre.overview': 'Overview',
  // File
  'menu.file': 'File',
  'menu.file.overview': 'Overview',
  'menu.file.warehouses': 'Warehouses',
  // Map
  'menu.map': 'Map',
  'menu.map.autoNavi': 'AutoNavi',
  // System
  'menu.management': 'Management',
  'menu.management.task': 'Task',
  'menu.management.dept': 'Dept',
  'menu.management.role': 'Role',
  // Profile
  'menu.profile': 'Profile',
  'menu.profile.settings': 'Settings',
  // Other
  'menu.list': 'List',
  'menu.result': 'Result',
  'menu.exception': 'Exception',
  'menu.form': 'Form',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.faq': 'FAQ',
  // Test
  'menu.test': 'Test',
  'menu.test.index': 'Lib-test',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,

  ...localeWorkplace,
  ...localeMonitor,

  ...localeWorkflow,

  ...localeManagement,

  ...localeProfileSettings,
  ...localeBasicSettings,
  ...localeSecuritySettings,

  ...locale403,
  ...locale404,
  ...locale500
}
