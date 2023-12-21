import { testRequest } from '@/service'

export function UploadFileChunk(data: FormData, fn: () => void) {
  return testRequest.post('file/uploadFileChunk', {
    ...data,
    onprogress: fn
  })
}
export function VerifyUpload(filename: string, filehash: string) {
  return testRequest.post('file/verify', { filename, filehash })
}
export function MergeChunksToFile(data: { size: number; filename: string; filehash: string }) {
  return testRequest.post('file/merge', data)
}
