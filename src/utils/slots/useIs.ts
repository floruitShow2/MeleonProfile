import type { VNode } from 'vue'

/**
 * 基础类型判断
 */
const opt = Object.prototype.toString
function isArray(obj: unknown) {
  return opt.call(obj) === '[object Array]'
}
function isNull(obj: unknown) {
  return opt.call(obj) === '[object Null]'
}
function isBoolean(obj: unknown) {
  return opt.call(obj) === '[object Boolean]'
}
function isObject(obj: unknown) {
  return opt.call(obj) === '[object Object]'
}
const isPromise = (obj: unknown) => {
  return opt.call(obj) === '[object Promise]'
}
function isString(obj: unknown) {
  return opt.call(obj) === '[object String]'
}
function isNumber(obj: unknown) {
  return opt.call(obj) === '[object Number]'
}
function isUndefined(obj: unknown) {
  return obj === undefined
}
function isFunction(obj: unknown) {
  return typeof obj === 'function'
}
function isEmptyObject(obj: Record<any, unknown>) {
  return isObject(obj) && Object.keys(obj).length === 0
}
function isWindow(el: unknown) {
  return el === window
}

export {
  isArray,
  isBoolean,
  isNumber,
  isEmptyObject,
  isFunction,
  isNull,
  isObject,
  isPromise,
  isString,
  isUndefined,
  isWindow
}

/**
 * 判断 VNode 节点类型
 */
interface IsElementType {
  (vn: VNode): boolean
}

const isElement: IsElementType = (vn) => {
  return Boolean(vn && vn.shapeFlag & 1)
}

const isComponent: IsElementType = (vn) => {
  return Boolean(vn && vn.shapeFlag & 6)
}

const isArrayChildren = (vn: VNode) => {
  return Boolean(vn && vn.shapeFlag & 16)
}

export { isElement, isComponent, isArrayChildren }
