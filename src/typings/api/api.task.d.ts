declare namespace ApiTask {
  export interface TagType {
    label: string
    type: 'primary' | 'danger' | 'success' | 'secondary' | 'warning'
    icon: string
  }

  export interface TaskEntity {
    // 分组
    group: TaskGroups
    // 任务名
    title: string
    // 任务描述
    desc: string
    priority: 0 | 1
    // 封面
    coverImage: string
    // 开始时间
    startTime: string
    // 结束时间
    endTime: string
    // 任务标签
    tags: TagType[]
    // 关联人
    relatives: string[]
    // 附件
    // attachments: File[]
  }
}
