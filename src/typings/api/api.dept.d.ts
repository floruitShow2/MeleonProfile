declare namespace ApiDept {
  export interface DeptInstance {
    id: number
    pid: number
    name: string
    label: string
    updateBy: string
    createBy: string
    updateTime: string | Date
    createTime: string | Date
    deptSort: number
    subCount: number
    leaf: boolean
    enabled: boolean
    hasChildren: boolean
    children?: DeptInstance[]
  }
}
