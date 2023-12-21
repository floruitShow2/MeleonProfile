import { defineComponent, toRefs } from 'vue'
import WsAvatar from '@/components/avatar/index'
import WsAvatarGroup from '@/components/avatarGroup/index'
import { formatToDate } from '@/utils/format/time'
import { Popover } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  props: {
    activeId: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => ({
        name: 'Warehouse_01',
        description: '这是一段描述文本',
        fileNums: 134,
        createTime: '2023-08-02 10:09:12',
        fileSize: '14GB',
        relatives: ['A', 'B', 'C', 'D', 'Flurit', 'F', 'G', 'H', 'I', 'J', 'K']
      })
    },
    disabled: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      default: ''
    }
  },
  emits: ['open'],
  setup(props, { emit }) {
    const { activeId, options } = toRefs(props)
    const handleOpenFolder = () => {
      emit('open', { id: activeId.value, name: options.value.name })
    }

    return () => (
      <div
        class={{
          'ws-folder-card': true,
          'is-active': props.active,
          'is-disabled': props.disabled
        }}
      >
        <div
          class={{
            'ws-folder-card-header': true,
            'has-cover': props.image
          }}
        >
          {props.image ? (
            <img src={props.image} />
          ) : (
            <i class={['iconfont ws-folder', props.disabled ? 'ibtn_disabled' : 'ibtn_base']}></i>
          )}
          {!props.disabled ? (
            <Popover
              trigger="click"
              position="right"
              contentClass="ws-more-popover"
              v-slots={{
                content: () => (
                  <ul class="ws-more-popover-wrapper">
                    <li onClick={handleOpenFolder}>打开</li>
                    <li>删除</li>
                  </ul>
                )
              }}
            >
              <i
                class={[
                  'iconfont ws-more',
                  props.disabled ? 'ibtn_disabled' : !props.image && 'ibtn_base ibtn_hover'
                ]}
                style={{
                  color: props.image && '#ffffff'
                }}
              ></i>
            </Popover>
          ) : (
            <i
              class={[
                'iconfont ws-more',
                props.disabled ? 'ibtn_disabled' : 'ibtn_base ibtn_hover'
              ]}
            ></i>
          )}
        </div>
        <div class="ws-folder-card-content">
          <div class="folder-name">{props.options.name || 'Warehouse_01'}</div>
          <div class="folder-message">
            <span>{props.options.description || '这是一段描述文本'}</span>
            <span>共{props.options.fileNums || 0}份文件</span>
          </div>
        </div>
        <div class="ws-folder-card-footer">
          <div class="footer-item">
            <span>CreateTime</span>
            <span>{props.options.createTime ? formatToDate(props.options.createTime) : '无'}</span>
          </div>
          <div class="footer-item">
            <span>Size</span>
            <span>{props.options.fileSize || '0'}</span>
          </div>
          <WsAvatarGroup disabled={props.disabled} maxCount={3}>
            {props.options.relatives.map((user: string) => (
              <WsAvatar size={28}>{user}</WsAvatar>
            ))}
          </WsAvatarGroup>
        </div>
      </div>
    )
  }
})
