import { useDeepClone } from '@/utils/format/object'

export type Level = `lvl${number}`

export interface FuzzyItemType {
  objectId: string | number | symbol
  type: Level
  hierarchy: Record<Level, string>
}

export interface FuzzyResultType {
  nbHits: number
  hits: FuzzyItemType[]
}

export interface RestrictType {
  // 节点id
  id: string | number | symbol
  // 父节点id
  pid: string | number | symbol | undefined
  // 节点名称
  label: string
  // 有无子节点
  hasChildren: boolean
  // 子节点列表
  children?: RestrictType[]
}
/**
 * 将一个平铺的一维数组转换为树形结构
 * @param data 一维数组，每个元素必须要有转换为树形结构所需的 id、pid 等
 * @returns 树形结构的数据
 */
export const ConvertToTree = <T extends RestrictType>(data: T[]): T[] => {
  const res: T[] = []
  const map: Record<string | number | symbol, T> = {}
  for (const dept of data) {
    map[dept.id] = dept.hasChildren ? { ...dept, ...{ children: [] } } : dept
  }

  for (const dept of data) {
    if (dept.pid) {
      const parent = map[dept.pid]
      parent.children?.push(map[dept.id])
    } else {
      res.push(map[dept.id])
    }
  }

  return res
}

/**
 *
 * @param target 目标数组中的元素必须有 id label children 属性
 * @param query 搜索条件，会过滤出所有符合查询条件的对象
 * @returns {
 *    hits: 搜索结果,
 *    nbHits: 符合条件的结果的数量
 * }
 */
export const ConvertToSearchFuzzyList = <T extends RestrictType>(
  target: Array<T>,
  query: string
) => {
  const hits: FuzzyItemType[] = []

  function dfs(deptList: Array<T>, depth: number, item?: FuzzyItemType) {
    for (let i = 0; i < target.length; i++) {
      const v = deptList[i]
      if (!v) return
      const backupItem: FuzzyItemType = item
        ? useDeepClone(item)
        : {
            objectId: 0,
            type: `lvl${depth}`,
            hierarchy: {}
          }
      backupItem.hierarchy[`lvl${depth}`] = v.label
      if (v.label.indexOf(query) !== -1) {
        backupItem.type = `lvl${depth}`
        backupItem.objectId = v.id
      }
      if (v.children && v.children.length) {
        dfs(v.children as Array<T>, depth + 1, backupItem)
      } else if (
        backupItem &&
        Object.keys(backupItem.hierarchy).some(
          (k) => backupItem.hierarchy[k as `lvl${number}`].indexOf(query) !== -1
        ) &&
        !hits.some((hit) => hit.hierarchy[hit.type] === backupItem.hierarchy[backupItem.type])
      ) {
        hits.push(backupItem)
      }
    }
  }

  dfs(target, 1)

  return {
    nbHits: hits.length,
    hits
  }
}
