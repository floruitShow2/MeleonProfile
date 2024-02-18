import { ref, computed, watch } from 'vue'
import * as SparkMD5 from 'spark-md5'

export default null as any

interface ChunkType {
  // 文件hash
  filehash: string
  index: number
  // 切片hash：文件 hash 值 + 切片索引
  hash: string
  chunk: Blob
  size: number
  percentage: number
}

enum WORKFLOW_STATUS {
  STANDBY = '准备上传文件',
  CALCULATE_HASH = '正在生成文件Hash',
  START_UPLOAD = '文件Hash已生成，开始上传',
  START_VERIFY = '校验文件',
  UPLOADING = '上传中...',
  UPLOAD_OVER = '文件已全部上传'
}

const SLICE_SIZE = 10 * 1024 * 1024
const UserToken = ref('')

// const filesUploadQueue = ref<File[]>([])
const requestUrl = ref('http://192.168.124.40:3000/api')

const recordFiles = ref<
  Record<
    string,
    {
      raw: File
      chunks: ChunkType[]
      uploaded: string[]
      requestList: XMLHttpRequest[]
    }
  >
>({})

const uploadPercentage = computed(() => {
  const result: Record<string, number> = {}
  Object.keys(recordFiles.value).forEach((filename) => {
    const { chunks, raw } = recordFiles.value[filename]
    const loaded = chunks
      .map((item) => {
        return item.size * item.percentage
      })
      .reduce((acc, cur) => acc + cur)
    result[filename] = parseInt((loaded / raw.size).toFixed(2), 10)
  })
  return result
})

watch(uploadPercentage, (newVal) => {
  postMessage({
    type: 'uploading',
    data: newVal
  })
})

// 接口封装
const request = <T>({
  url,
  method = 'post',
  data,
  onProgress = (e) => e,
  requestList
}: {
  url: string
  method: 'post' | 'get'
  data: any
  headers?: Record<string, any>
  onProgress?: (e: any) => any
  requestList?: XMLHttpRequest[]
}): Promise<T> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = onProgress
    xhr.open(method, url)
    // Object.keys(headers).forEach((key) => xhr.setRequestHeader(key, headers[key]))
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('user_token', UserToken.value)
    xhr.send(data)
    xhr.onload = (e) => {
      // 将请求成功的 xhr 从列表中删除
      // remove xhr which status is success
      if (requestList) {
        const xhrIndex = requestList.findIndex((item) => item === xhr)
        requestList.splice(xhrIndex, 1)
      }
      const target = e.target as { response: string } | null
      resolve(target ? JSON.parse(target.response).ReturnData : '')
    }
    // 暴露当前 xhr 给外部
    requestList?.push(xhr)
  })
}
// 上传状态函数
const respondStatus = (type: keyof typeof WORKFLOW_STATUS, filename: string) => {
  postMessage({
    type: 'uploadStatus',
    data: JSON.stringify({
      status: WORKFLOW_STATUS[type],
      filename
    })
  })
}

const VerifyUpload = async (filename: string, filehash: string) => {
  const res = await request<{ shouldUpload: boolean; uploadedList: string[] }>({
    url: `${requestUrl.value}/file/verify`,
    method: 'post',
    data: JSON.stringify({
      filename,
      filehash
    })
  })
  return res
}
const UploadFileChunk = (
  filename: string,
  chunk: FormData,
  onProgress: (e: ProgressEvent) => void
) => {
  return request({
    url: `${requestUrl.value}/file/uploadFileChunk`,
    method: 'post',
    data: chunk,
    onProgress,
    requestList: recordFiles.value[filename].requestList
  })
  // return new Promise((resolve) => {
  //   fetch(, {
  //     method: 'post',
  //     body: chunk
  //   })
  //     .then((res) => {
  //       console.log(res)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // })
}
const MergeRequest = async (fileName: string, fileHash: string) => {
  const res = await request({
    url: `${requestUrl.value}/file/merge`,
    method: 'post',
    data: JSON.stringify({
      size: SLICE_SIZE,
      filename: fileName,
      filehash: fileHash
    })
  })
  return res
}

const hashPercentage = ref<Record<string, number>>({})
// 创建文件切片列表
const createFileChunk = (file: File, size = SLICE_SIZE) => {
  const fileChunkList: Array<{ file: Blob }> = []
  let cur = 0
  while (cur < file.size) {
    fileChunkList.push({ file: file.slice(cur, cur + size) })
    cur += size
  }
  return fileChunkList
}
// 基于切片列表生成 hash
const calculateHash = (fileChunkList: Array<{ file: Blob }>, filename: string): Promise<string> => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    let count = 0
    const loadNext = (index: number) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(fileChunkList[index].file)
      reader.onload = (e: any) => {
        count++
        spark.append(e.target.result)
        if (count === fileChunkList.length) {
          // self.postMessage({
          //   percentage: 100,
          //   hash: spark.end()
          // })
          // self.close()
          hashPercentage.value[filename] = 100
          resolve(spark.end())
        } else {
          hashPercentage.value[filename] += 100 / fileChunkList.length
          // self.postMessage({
          //   percentage
          // })
          if (count < fileChunkList.length) {
            loadNext(count)
          }
        }
      }
    }
    loadNext(0)
  })
}
// 监听请求的 onProgress 事件
const createProgressHandler = (fileName: string, item: ChunkType) => {
  return (e: ProgressEvent) => {
    const { loaded, total } = e
    if (!total) return
    const percentage = parseInt(String((loaded / total) * 100), 10)
    const findIdx = recordFiles.value[fileName].chunks.findIndex(
      (chunk) => chunk.hash === item.hash
    )
    if (findIdx !== -1) {
      recordFiles.value[fileName].chunks[findIdx].percentage = percentage
    }
  }
}
const uploadChunks = async (
  fileName: string,
  fileHash: string,
  chunks: ChunkType[] = [],
  uploadedList: string[] = []
) => {
  if (!fileName || !fileHash) return
  const requestList = chunks
    .filter(({ hash }) => !uploadedList.includes(hash))
    .map(({ chunk, hash, filehash }, index) => {
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('hash', hash)
      formData.append('filename', fileName)
      formData.append('filehash', filehash)
      return { formData, index }
    })
    .map(({ formData, index }) => {
      return UploadFileChunk(fileName, formData, createProgressHandler(fileName, chunks[index]))
    })
  // 并发请求
  respondStatus('UPLOADING', fileName)
  await Promise.all(requestList)
  if (uploadedList.length + requestList.length === chunks.length) {
    await MergeRequest(fileName, fileHash)
    respondStatus('UPLOAD_OVER', fileName)
  }
}

const startUpload = async (rawfile: File) => {
  // 准备上传
  respondStatus('STANDBY', rawfile.name)
  const fileChunkList = createFileChunk(rawfile)
  respondStatus('CALCULATE_HASH', rawfile.name)
  const hash = await calculateHash(fileChunkList, rawfile.name)
  respondStatus('START_VERIFY', rawfile.name)
  // 校验后端是否已存在相同 hash 的文件目录
  const { shouldUpload, uploadedList } = await VerifyUpload(rawfile.name, hash)
  if (!shouldUpload) {
    // this.$message.success('skip upload：file upload success, check /target directory')
    respondStatus('UPLOAD_OVER', rawfile.name)
    return
  }
  const chunks: ChunkType[] = fileChunkList.map(({ file }, index) => ({
    filehash: hash,
    index,
    hash: `${hash}-${index}`,
    chunk: file,
    size: file.size,
    percentage: uploadedList.includes(hash) ? 100 : 0
  }))
  recordFiles.value[rawfile.name] = {
    chunks,
    uploaded: uploadedList,
    raw: rawfile,
    requestList: []
  }
  respondStatus('START_UPLOAD', rawfile.name)
  uploadChunks(rawfile.name, hash, recordFiles.value[rawfile.name].chunks, uploadedList)
}
const stopUpload = (filename: string) => {
  recordFiles.value[filename].requestList.forEach((xhr) => xhr.abort())
  recordFiles.value[filename].requestList = []
}

// 策略模式，接收主线程传递的命令
const strategyMap: Record<string, (data: Record<string, any>) => void> = {
  url: (data) => {
    requestUrl.value = data.url as string
  },
  pause: (data) => {
    stopUpload(data.filename as string)
  },
  upload: (data) => {
    const fileList = data.file as File[]
    // filesUploadQueue.value.push(...fileList)
    fileList.forEach((file) => startUpload(file))
  },
  token: (data) => {
    UserToken.value = data.token
  }
}
onmessage = (e) => {
  strategyMap[e.data.type](e.data)
}
