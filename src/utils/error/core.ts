import { DefaultOptions, Options, TrackerConfig } from './types'
// import { createHistoryEvent } from '../utils/pv'
// 鼠标事件列表
const mouseEventList: string[] = [
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseout'
]
export default class Tracker {
  // 暴露一个上报类
  public data: Options

  constructor(options: Options) {
    // 传的默认参数
    // 传的参数覆盖默认兜底的参数
    this.data = Object.assign(this.initDef(), options) // 根据参数触发监听对应内容
    this.installTracker()
  } // 兜底逻辑：返回一些默认参数 里面也可以增加一些初始化的操作 因为构造函数内会执行这个兜底方法

  private initDef(): DefaultOptions {
    // history.pushState() 方法向浏览器的会话历史栈增加了一个条目。
    // replaceState()方法使用state objects, title,和 URL 作为参数，修改当前历史记录实体，如果你想更新当前的 state 对象或者当前历史实体的 URL 来响应用户的的动作的话这个方法将会非常有用。
    // history.replaceState(stateObj, "", "bar2.html");执行后会替换到bar2.html但不会加载bar2.html页面
    // window.history.pushState = createHistoryEvent('pushState')
    // window.history.replaceState = createHistoryEvent('replaceState')
    console.log(this.data)
    return <DefaultOptions>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false
    }
  }

  /**
   * 捕获事件的监听器
   * @param mouseEventList 要监听的事件列表 是个字符串数组
   * @param targetKey 一个关键字 一般传给后台 要给后台协商
   * @param data 数据 可填可不填
   */
  private captureEvents<T>(eventList: string[], targetKey: string, data?: T) {
    eventList.forEach((event) => {
      // 监听
      window.addEventListener(event, (e: any) => {
        // 回调
        console.log('监听到了') // 调用接口实现上报
        this.reportTracker({
          event,
          targetKey,
          data
        })
      })
    })
  } // 手动上报

  public sendTracker<T>(data: T) {
    // 调用接口实现上报
    this.reportTracker(data)
  } // 埋点触发器 根据传来的监听配置来判断监听哪些内容

  private installTracker() {
    // history上报
    if (this.data.historyTracker) {
      // 传入history上报需要监听的事件列表
      this.captureEvents(['pushState', 'replaceState', 'popstate'], 'pv-history') // 注意popstate是小写
    } // hash上报
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'pv-hash')
    } // dom上报
    if (this.data.domTracker) {
      this.domReport('dom')
    } //  js报错上报
    if (this.data.jsError) {
      this.jsError()
    }
  } // 接口实现上报

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, {
      time: new Date().getTime()
    })
    const headers = {
      type: 'application/x-www-form-urlencoded'
    }
    const blob = new Blob([JSON.stringify(params)], headers)
    navigator.sendBeacon(this.data.requestUrl, blob)
  } // uuid

  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid
  } // 透传字段

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra
  } // dom事件上报

  private domReport(targetKey: string) {
    mouseEventList.forEach((ev) => {
      window.addEventListener(ev, (e) => {
        // console.log(e.target);
        const target = e.target as HTMLElement
        if (target.getAttribute('target-key')) {
          console.log('监听到带有target-key属性元素的dom事件')
          this.reportTracker({
            event: ev,
            targetKey
          })
        }
        console.log('未监听到带有target-key属性元素的dom事件') // let activeElement = document.activeElement; // if (activeElement?.getAttribute("target-key")) { // console.log("监听到dom事件"); // }
      })
    })
  } // 常规报错上报

  private errorEvent() {
    window.addEventListener('error', (event) => {
      console.log(event.message, '常规报错')
      this.reportTracker({
        event: 'error',
        targetKey: 'message',
        message: event.message
      })
    })
  } // Promise报错上报

  private promiseReject() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch((error) => {
        console.log(error, 'promise报错')
        this.reportTracker({
          event: 'unhandledrejection',
          targetKey: 'message',
          reason: error
        })
      })
    })
  } // js报错 包括常规报错和Promise报错

  private jsError() {
    this.errorEvent()
    this.promiseReject()
  }
}
