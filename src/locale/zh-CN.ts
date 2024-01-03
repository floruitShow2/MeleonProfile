import localeMessageBox from '@/components/message-box/locale/zh-CN'
import localeLogin from '@/views/login/locale/zh-CN'

// 首页
import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN'

import localeMonitor from '@/views/dashboard/monitor/locale/zh-CN'

// 工具
import localeWorkflow from '@/views/instrument/workflow/locale/zh-CN'

// 异常
import locale403 from '@/views/exception/403/locale/zh-CN'
import locale404 from '@/views/exception/404/locale/zh-CN'
import locale500 from '@/views/exception/500/locale/zh-CN'

// 系统管理
import localeManagement from '@/views/management/dept/locale/zh-CN'

import localeSettings from './zh-CN/settings'

export default {
  // 首页
  'menu.dashboard': '仪表盘',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  // 工具
  'menu.instrument': '工具管理',
  'menu.instrument.chat': '聊天工具',
  'menu.instrument.workflow': '工作流程',
  // 文章管理
  'menu.articles': '文章管理',
  'menu.articles.overview': '数据看板',
  'menu.articles.list': '文章列表',
  'menu.articles.editor': '写文章',
  // 三维模型
  'menu.three': '三维模型',
  'menu.three.object': '基础对象',
  'menu.three.vector': '基础向量',
  'menu.three.example': '演示案例',
  'menu.three.vr': 'VR',
  'menu.three.vrHall': 'VR云展厅',
  // 数据中心
  'menu.datacentre': '数据中心',
  'menu.datacentre.overview': '数据预览',
  // 文件管理
  'menu.file': '文件管理',
  'menu.file.overview': '文件中心',
  'menu.file.warehouses': '文件仓库',
  // 地图管理
  'menu.map': '地图应用',
  'menu.map.autoNavi': '高德地图',
  // 系统管理
  'menu.management': '系统管理',
  'menu.management.task': '任务管理',
  'menu.management.dept': '部门管理',
  'menu.management.role': '角色管理',
  // 其他
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,

  ...localeWorkplace,
  ...localeMonitor,

  ...localeWorkflow,

  ...localeManagement,

  ...locale403,
  ...locale404,
  ...locale500
}
