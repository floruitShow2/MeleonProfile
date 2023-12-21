declare namespace ApiFile {
  export interface WarehouseType {
    id: string
    disabled: boolean
    image?: string
  }

  export interface RecentFileType {
    file: {
      filename: string
      filesize: number
    }
    uploader: string
    uploadTime: string | number | Date
    views: number
    download: number
    relatives: string[]
  }

  export type OperationType = 'upload' | 'delete' | 'view'
  export interface OperationLogType {
    operator: string
    operateTime: string | number | Date
    type: OperationType
    files: {
      filename: string
      filesize: number
    }[]
  }
}
