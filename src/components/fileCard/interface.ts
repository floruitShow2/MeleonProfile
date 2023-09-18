export interface ToolType {
  type: 'view' | 'download' | 'upload' | 'delete'
  icon: string
  disabled: boolean
}
