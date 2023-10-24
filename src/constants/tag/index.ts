export enum TagColorMap {
  'primary' = 'arcoblue',
  'danger' = 'red',
  'success' = 'green',
  'secondary' = 'gray',
  'warning' = 'gold'
}
export enum TypeColorMap {
  'primary' = 'rgb(var(--primary-6))',
  'danger' = 'rgb(var(--red-6))',
  'success' = 'rgb(var(--green-6))',
  'secondary' = 'var(--color-fill-2)',
  'warning' = 'rgb(var(--yellow-6))'
}

export const StaticTags: ApiTask.TagType[] = [
  {
    label: '进展中',
    type: 'primary',
    icon: ''
  },
  {
    label: '设计中',
    type: 'primary',
    icon: ''
  },
  {
    label: '规划中',
    type: 'success',
    icon: ''
  },
  {
    label: '问题报警',
    type: 'danger',
    icon: ''
  }
]
