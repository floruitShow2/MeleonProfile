export interface FileMessage {
  filehash: string
  index: number
  hash: string
  chunk: Blob
  size: number
  percentage: number
}
