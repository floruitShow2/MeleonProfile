export function useDeepClone<T>(target: T): T {
  // 目标值为 非引用类型，直接返回目标值
  if (typeof target !== 'object') {
    return target
  }
  let temp: any
  if (Array.isArray(target)) {
    temp = []
    target.forEach((item) => {
      temp.push(useDeepClone(item))
    })
  } else {
    temp = {}
    for (const item in target) {
      if (target[item] instanceof Date) {
        const time = new Date(String(target[item]))
        temp[item] = time
      } else {
        temp[item] = useDeepClone(target[item])
      }
    }
  }
  return temp
}
