export function ConvertToTree(data: ApiDept.DeptInstance[]): ApiDept.DeptInstance[] {
  const res: ApiDept.DeptInstance[] = []
  const map: Record<number, ApiDept.DeptInstance> = {}
  for (const dept of data) {
    map[dept.id] = dept.hasChildren ? { ...dept, ...{ children: [] } } : dept
  }

  for (const dept of data) {
    const parent = map[dept.pid]
    if (parent) {
      parent.children?.push(map[dept.id])
    } else {
      res.push(map[dept.id])
    }
  }

  return res
}
