import { PropType, computed, defineComponent, ref, toRefs } from 'vue'
import { formatToDateTime } from '@/utils/format'
import WsAvatar from '@/components/avatar'
import WsFileCard from '@/components/fileCard'
import './index.less'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ApiFile.OperationLogType>,
      required: true
    },
    showLine: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const { data, showLine } = toRefs(props)

    const wrapperRef = ref()

    const wrapperHeight = computed(() => {
      if (!wrapperRef.value) return 0
      const { height } = wrapperRef.value.getBoundingClientRect()
      return showLine.value ? height - 20 : 0
    })

    return () => (
      <div class="ws-log-item">
        <div class="log-aside">
          <WsAvatar class="dot">{data.value.operator}</WsAvatar>
          <div class="line" style={{ height: `${wrapperHeight.value}px` }} />
        </div>
        <div ref={wrapperRef} class="log-wrapper">
          <div class="log-wrapper-title">
            <span>{data.value.operator}</span>
            <span>{formatToDateTime(data.value.operateTime)}</span>
          </div>
          <div class="log-wrapper-content">
            <span class={['keyword', `is-${data.value.type}`]}>
              <i class={['iconfont', `ws-${data.value.type}`]}></i>
              {data.value.type}
            </span>
            {/* {log.files.map((file) => (
                    <span>{`#${file.filename}`}</span>
                  ))} */}
            {data.value.files.map((file) => (
              <WsFileCard filename={file.filename} filesize={file.filesize} size="mini" />
            ))}
          </div>
        </div>
      </div>
    )
  }
})
