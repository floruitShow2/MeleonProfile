import { ExpTimeMode } from '@/components/Panel/common/types'
import { getLocalStorage, setLocalStorage } from '@/utils/tools'

export const minutesOptions: Array<number | 'Custom'> = [5, 10, 30, 50, 'Custom']
export const hoursOptions: Array<number | 'Custom'> = [4, 8, 12, 24, 'Custom']
export const commonOptions: Array<number | 'Custom'> = [1, 2, 3, 4, 'Custom']
export const initExpTimeData = (value?: string): ExpTimeMode => {
  if (!value) {
    return { custom: false }
  }
  const mode = value.replace(/\d+/g, '-')
  const number = value.match(/\d+/)?.[0]
  const num = number == undefined ? undefined : Number(number).valueOf()
  let customValue = `${mode}_${num}`
  let custom = false

  switch (mode) {
    case 'PT-M':
      // @ts-expect-error
      if (!minutesOptions.includes(num)) {
        customValue = `${mode}_Custom`
        custom = true
      }
      return { custom, num, mode, value, customValue }
    case 'PT-H':
      // @ts-expect-error
      if (!hoursOptions.includes(num)) {
        customValue = `${mode}_Custom`
        custom = true
      }
      return { custom, num, mode, value, customValue }
    case 'P-D':
    case 'P-W':
    case 'P-M':
      // @ts-expect-error
      if (!commonOptions.includes(num)) {
        customValue = `${mode}_Custom`
        custom = true
      }
  }
  return { custom, num, mode, value, customValue }
}
export const generateExpTimeString = (expTimeFata: ExpTimeMode): string => {
  if (expTimeFata.custom) {
    const { num, mode } = expTimeFata
    return mode!.replace('-', `${num || ''}`)
  }
  const { customValue } = expTimeFata
  if (!customValue) return ''
  const [mode, num] = customValue.split('_')
  return mode!.replace('-', `${num || ''}`)
}

// properties panel 的部分全局配置保存
export const clearStorage = () => {
  setLocalStorage('panel-data', {})
}
export const getStorage = () => {
  return getLocalStorage('panel-data') || {}
}
export const updateStorage = (key: string, value: any) => {
  const data = getStorage()

  data[key] = value

  setLocalStorage('panel-data', data)
}
