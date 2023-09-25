import { defineComponent, ref } from 'vue'
import type { Component } from 'vue'
import WsFileCard from '@/components/fileCard/index'
import { formatBytes } from '@/utils/file'
import LargeFileInstance from './instance'
import './index.less'

export default defineComponent({
  props: {
    draggable: {
      type: Boolean,
      default: false
    },
    showFileList: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    // 当缓存的文件数量发生变化时触发
    'change',
    // 当文件上传完成时触发
    'success'
  ],
  setup(props, { slots, emit }) {
    const inputRef = ref()

    const instance = new LargeFileInstance()
    const worker = instance.getWorker()

    // 文件缓冲区：缓存从本地读取的文件，用户点击确认后再将数据发送到文件上传线程
    const filesBuffer = ref<File[]>([])
    const filesPercentage = ref<Record<string, number>>({})

    // 文件上传状态
    const filesStatus = ref<string[]>([])
    const statusRefs = ref<Array<HTMLElement | Component>>([])
    const statusTimer = ref<NodeJS.Timer>()
    const updateFilesStatus = () => {
      if (filesStatus.value.length === 0) {
        clearInterval(statusTimer.value)
        return
      }
      const firstStatus = filesStatus.value[0]
      const firstRef = statusRefs.value[0]
      if (!firstStatus || !firstRef) return
      const ele: HTMLElement = '$el' in firstRef ? firstRef.$el : firstRef
      const { width } = ele.getBoundingClientRect()
      ele.animate(
        [
          {
            transform: `translateX(0)`,
            opacity: 1
          },
          {
            transform: `translateX(${width}px)`,
            opacity: 0
          }
        ],
        { duration: 500, easing: 'ease', fill: 'both' }
      )
      filesStatus.value.shift()
    }

    // 监听 worker 发送的请求参数
    worker.onmessage = (e) => {
      const { type, data } = e.data
      if (type === 'uploading') {
        for (const k in data) {
          if (k in filesPercentage.value) filesPercentage.value[k] = data[k]
        }
      } else if (type === 'uploadStatus') {
        if (filesStatus.value.length === 0) {
          statusTimer.value = setInterval(updateFilesStatus, 1200)
        }
        const { status, filename } = JSON.parse(data)
        filesStatus.value = [...new Set([...filesStatus.value, status])]
        if (status === '文件已全部上传') {
          const findIdx = filesBuffer.value.findIndex((file) => file.name === filename)
          if (findIdx === -1) return
          emit('success', {
            file: filesBuffer.value[findIdx],
            fileList: filesBuffer.value
          })
        }
      }
    }

    const handleUpload = async (e: { filename: string }) => {
      const { filename } = e
      const findIdx = filesBuffer.value.findIndex((file) => file.name === filename)
      if (findIdx === -1) return
      const file = filesBuffer.value[findIdx]
      worker.postMessage({
        type: 'upload',
        file: Array.from([file])
      })
    }

    const updateFilesBuffer = (filesArray: File[]) => {
      filesArray.forEach((file) => {
        filesPercentage.value[file.name] = 0
      })
      filesBuffer.value = [...filesBuffer.value, ...filesArray]
      emit('change', filesBuffer.value)

      if (props.autoUpload) {
        filesBuffer.value.forEach((file) => {
          handleUpload({ filename: file.name })
        })
      }
    }
    // 通过点击事件触发 input 控件的 change 事件
    const handleClick = () => {
      if (!inputRef.value) return
      inputRef.value.click()
    }
    // 通过拖拽事件获取到文件
    const isDragging = ref<boolean>(false)

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (!isDragging.value) {
        isDragging.value = true
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (isDragging.value) {
        isDragging.value = false
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragging.value = false
      const files = Array.from(e.dataTransfer?.files || [])
      updateFilesBuffer(files)
    }

    const handleFileChange = async (e: Event) => {
      const inputElement = e.target as HTMLInputElement | null
      if (!inputElement || !inputElement.files) {
        // this.$message('未获取到文件')
        return
      }
      const { files } = inputElement
      const filesArray = Array.from(files)
      updateFilesBuffer(filesArray)
    }

    const renderButton = () => {
      if (slots.default) {
        return <span onClick={handleClick}>{slots.default()}</span>
      }
      if (props.draggable) {
        return (
          <div
            class={{
              'file-input__trigger': true,
              'file-input-drag-active': isDragging.value
            }}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragover={handleDragOver}
            onDragleave={handleDragLeave}
          >
            <i class="iconfont ws-upload"></i>
            <div class="file-input__trigger-text">
              {slots.trigger ? (
                slots.trigger()
              ) : (
                <div class="default-text">
                  <span>click to upload</span> or drag the file here
                </div>
              )}
            </div>
            <div class="file-input__trigger-status">
              {filesStatus.value.map((status, index) => (
                <div
                  ref={(el) => {
                    if (el && statusRefs.value) statusRefs.value[index] = el
                  }}
                  class="status-label"
                >
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
      return (
        <div class="file-input__button" onClick={handleClick}>
          默认按钮
        </div>
      )
    }

    return () => (
      <div class="ws-large-file">
        <div class="file-input__inner">
          <input type="file" ref={inputRef} onChange={handleFileChange} />
          {/* <i class="iconfont ws-upload ibtn_base" onClick={handleClick}></i> */}
        </div>
        {renderButton()}
        {/* 文件列表 */}
        {props.showFileList && (
          <div class="file-input__buffer">
            {filesBuffer.value.map((file) => (
              <WsFileCard
                filename={file.name}
                filesize={formatBytes(file.size)}
                tools={['view', 'upload', 'delete']}
                percent={filesPercentage.value[file.name] / 100}
                onUpload={handleUpload}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
})
