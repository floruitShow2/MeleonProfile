import type { MockMethod } from 'vite-plugin-mock'

const apis: MockMethod[] = [
  {
    url: '/mock/api/depts/getAll',
    method: 'get',
    response: (): Service.MockServiceResult<ApiDept.DeptInstance[]> => {
      return {
        Code: 1,
        Message: 'ok',
        ReturnData: [
          {
            id: 1,
            pid: 0,
            name: '华北分部',
            label: '华北分部',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-6',
            createTime: '2023-4-6',
            deptSort: 0,
            subCount: 1,
            leaf: false,
            enabled: false,
            hasChildren: true
          },
          {
            id: 5,
            pid: 1,
            name: '研发部',
            label: '研发部',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-6',
            createTime: '2023-4-6',
            deptSort: 0,
            subCount: 2,
            leaf: true,
            enabled: false,
            hasChildren: true
          },
          {
            id: 8,
            pid: 5,
            name: '前端组',
            label: '前端组',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-7',
            createTime: '2023-4-7',
            deptSort: 0,
            subCount: 0,
            leaf: true,
            enabled: false,
            hasChildren: false
          },
          {
            id: 7,
            pid: 5,
            name: '后端组',
            label: '后端组',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-8',
            createTime: '2023-4-8',
            deptSort: 0,
            subCount: 0,
            leaf: true,
            enabled: false,
            hasChildren: false
          },
          {
            id: 2,
            pid: 0,
            name: '华南分部',
            label: '华南分部',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-10',
            createTime: '2023-4-10',
            deptSort: 0,
            subCount: 1,
            leaf: false,
            enabled: false,
            hasChildren: true
          },
          {
            id: 4,
            pid: 2,
            name: '设计部',
            label: '设计部',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-11',
            createTime: '2023-4-11',
            deptSort: 0,
            subCount: 2,
            leaf: true,
            enabled: false,
            hasChildren: true
          },
          {
            id: 9,
            pid: 4,
            name: 'UI设计',
            label: 'UI设计',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-12',
            createTime: '2023-4-12',
            deptSort: 0,
            subCount: 0,
            leaf: true,
            enabled: false,
            hasChildren: false
          },
          {
            id: 10,
            pid: 4,
            name: '机械设计',
            label: '机械设计',
            updateBy: '',
            createBy: '',
            updateTime: '2023-4-13',
            createTime: '2023-4-13',
            deptSort: 0,
            subCount: 0,
            leaf: true,
            enabled: false,
            hasChildren: false
          }
        ]
      }
    }
  }
]

export default apis
