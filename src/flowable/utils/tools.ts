/* 空函数 */
export function noop() {}

/**
 * 校验非空
 * @param {*} val
 * @return boolean
 */
export function notEmpty(val) {
  if (!notNull(val)) {
    return false
  }
  if (getRawType(val) === 'array') {
    return val.length
  }
  if (getRawType(val) === 'object') {
    return Reflect.ownKeys(val).length
  }
  return true
}
export function notNull(val) {
  return val !== undefined && val !== null
}

/**
 * 返回数据原始类型
 * @param value
 * @return { 'string' | 'array' | 'boolean' | 'number' | 'object' | 'function' } type
 */
export function getRawType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

export type RawType =
  | 'string'
  | 'array'
  | 'boolean'
  | 'number'
  | 'object'
  | 'function'
  | 'regexp'
  | 'date'
  | 'symbol'
  | 'map'
  | 'set'
  | 'weakmap'
  | 'weakset'

export const toTypeString = (value: unknown): string => Object.prototype.toString.call(value)

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

export function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function filterTreeData(treeData: any[], filterKey: string, keyword?: string): any[] {
  if (!keyword) return treeData

  const loop = (data: any[]) => {
    const result: any[] = []
    data.forEach((item) => {
      if (item[filterKey]?.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
        result.push({ ...item })
      } else if (item.children) {
        const filterData = loop(item.children)
        if (filterData.length) {
          result.push({
            ...item,
            children: filterData
          })
        }
      }
    })
    return result
  }
  return loop(treeData)
}

export const storagePrefix = '__bpmn-designer__'
export function getLocalStorage(key: string) {
  const res = window.localStorage.getItem(`${storagePrefix}${key}`)
  return res ? JSON.parse(res) : null
}
export function setLocalStorage(key: string, value: any) {
  window.localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value || ''))
}
