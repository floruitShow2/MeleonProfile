export enum EventsMap {
  // 加载事件
  // 开始加载
  oLS = 'onLoadStart',
  // 加载中
  oLP = 'onLoadProgress',
  // 加载出错
  oLE = 'onLoadError',
  // 加载完成
  oLC = 'onLoadCompleted',

  // 详情点 点击事件
  oDC = 'onDetailClick',
  // 跳转点 点击事件
  oJC = 'onJumperClick',
  // 移动点 点击事件
  oMC = 'onMoveClick',
  // 信息点 点击事件
  oPC = 'onPointClick',

  // 可视点更新
  oVP = 'onVisiblePoints',
  // 视角更新
  oPeC = 'onPerspectiveChange'
}
