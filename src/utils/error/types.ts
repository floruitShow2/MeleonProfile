/**
 * 这是一个默认值的接口，用于埋点类Tracker传递初识化时配置默认值
 * @uuid 做uv的 uv标识
 * @requestUrl 接口地址
 * @historyTracker history上报 单页面应用时 一种模式是hash一种模式是history
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersionsdk sdk版本上报
 * @extra 透传字段 用户可以自定义一些参数 也可以上报这些
 * @jsError js 和 promise 报错异常上报
 */
export interface DefaultOptions {
  uuid: string | undefined
  requestUrl: string | undefined
  historyTracker: boolean
  hashTracker: boolean
  domTracker: boolean
  sdkVersion: string | number
  extra: Record<string, any> | undefined
  jsError: boolean
}
/**
 * @Options 继承于DefaultOptions
 * @Pirtial Partial实现将<>内的所有属性设置为可选。
 * 因此以下继承的默认参数都将是可传可不传的的
 */
export interface Options extends Partial<DefaultOptions> {
  requestUrl: string // 这里又重写了requestUrl属性 意味着其他属性都是可传 但requestUrl必传
}
/**
 * version枚举
 */
export enum TrackerConfig {
  version = '1.0.0'
}
