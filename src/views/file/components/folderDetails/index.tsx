import { defineComponent, toRefs, ref } from 'vue'
import { convertToBytes } from '@/utils/file'
import WsLargeFile from '@/components/largeFile'
import WsOperationLogs from '../folderLogs'
import './index.less'

export default defineComponent({
  props: {
    activeId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { activeId } = toRefs(props)

    // 基础信息
    const cardMessages = ref([
      {
        type: 'doc',
        size: '195MB',
        total: '2GB'
      },
      {
        type: 'pdf',
        size: '322MB',
        total: '2GB'
      },
      {
        type: 'xlsx',
        size: '211MB',
        total: '2GB'
      },
      {
        type: 'jpeg',
        size: '1.2GB',
        total: '2GB'
      }
    ])

    return () => (
      <div class="ws-folder-details">
        {/* 基础数据 */}
        <div class="base-detail">
          <div class="base-detail-header">
            <span>Warehouse {activeId.value}</span>
            <i class="iconfont ws-menu ibtn_base ibtn_mini ibtn_hover"></i>
          </div>
          <div class="base-detail-content">
            {cardMessages.value.map((card) => (
              <div class="detail-card">
                <div class="detail-card-message">
                  <span>
                    <i class={`iconfont ws-${card.type}`}></i>
                    {card.type}
                  </span>
                  <span>
                    {card.size} / {card.total}
                  </span>
                </div>
                <a-progress
                  type="circle"
                  size="small"
                  percent={Number(
                    (convertToBytes(card.size) / convertToBytes(card.total)).toFixed(3)
                  )}
                />
              </div>
            ))}
          </div>
        </div>
        {/* 文件上传 */}
        <div class="upload-trigger">
          <WsLargeFile draggable autoUpload={true} />
        </div>
        <WsOperationLogs activeId={activeId.value} />
      </div>
    )
  }
})
