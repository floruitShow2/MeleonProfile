import { PropType, defineComponent, toRefs, ref, computed, watch } from 'vue'
import { Tooltip, Progress } from '@arco-design/web-vue'
import { generateFileIcon, formatBytes } from '@/utils/file'
import { cs } from '@/utils/property'
import type { ToolType } from './interface'
import './index.less'

const DefaultTypes: string[] = ['view', 'download', 'upload', 'delete']
const DefaultTools: ToolType[] = [
  {
    type: 'view',
    icon: '',
    disabled: false
  },
  {
    type: 'download',
    icon: '',
    disabled: false
  },
  {
    type: 'upload',
    icon: '',
    disabled: false
  },
  {
    type: 'delete',
    icon: '',
    disabled: false
  }
]

export default defineComponent({
  props: {
    filename: {
      type: String,
      required: true
    },
    filesize: {
      type: [String, Number],
      required: true
    },
    tools: {
      type: Array as PropType<Array<ToolType | string>>,
      default: () => {
        return [
          {
            type: 'view',
            icon: '',
            disabled: false
          },
          {
            type: 'download',
            icon: '',
            disabled: false
          }
        ]
      }
    },
    size: {
      type: String as PropType<'mini' | 'small' | 'medium' | 'large'>,
      default: 'medium'
    },
    percent: {
      type: Number,
      default: 0
    },
    hiddenTools: {
      type: Boolean,
      default: false
    }
  },
  emits: ['download', 'view', 'upload', 'delete'],
  setup(props, { emit }) {
    const { tools, percent, filename, filesize, size } = toRefs(props)

    const prefix = 'is'
    const classNames = cs('ws-file-card', [`${prefix}-${size.value}`])

    const displayTools = ref<ToolType[]>([])

    // 将用户传入的工具转换为组件需要的格式
    const toolsMap = computed(() => displayTools.value.map((tool) => tool.type))
    const convertTools = (toolList: Array<ToolType | string>): ToolType[] => {
      return toolList
        .filter((item) => {
          if (typeof item === 'string') {
            return DefaultTypes.includes(item)
          }
          return DefaultTypes.includes(item.type)
        })
        .map((tool) => {
          if (typeof tool === 'string') {
            const findTool = DefaultTools.find((item) => item.type === tool)
            return findTool || ({ type: tool, icon: '', disabled: false } as ToolType)
          }
          return tool
        })
    }

    watch(
      tools,
      (newVal) => {
        displayTools.value = convertTools(newVal)
      },
      { immediate: true }
    )

    // 响应用户对工具的点击事件
    const handleToolClick = (type: ToolType['type']) => {
      emit(type, { filename: filename.value, size: filesize.value })
    }
    const mapZhCN = {
      view: '预览',
      download: '下载',
      upload: '上传',
      delete: '删除'
    }
    return () => (
      <div class={classNames}>
        {toolsMap.value.includes('upload') && percent.value > 0 && (
          <Progress
            percent={percent.value}
            showText={false}
            animation={true}
            color={{
              '0%': 'var(--primary-blue-color)',
              '100%': 'var(--primary-blue-color)'
            }}
          />
        )}
        <div class="card-icon">
          <i class={['iconfont', `ws-${generateFileIcon(filename.value)}`]}></i>
        </div>
        <div class="card-message">
          <div class="card-message-name" title={filename.value}>
            {filename.value}
          </div>
          <div class="card-message-details">
            <span>
              {typeof filesize.value === 'number' ? formatBytes(filesize.value) : filesize.value}
            </span>
          </div>
        </div>
        {!props.hiddenTools && (
          <div class="card-tools">
            {displayTools.value.map((tool) => {
              const $tool = tool as ToolType
              return (
                <Tooltip
                  content={mapZhCN[$tool.type]}
                  v-slots={{
                    default: () => (
                      <i
                        class={[
                          'iconfont',
                          'ibtn_base',
                          `ibtn_${size.value}`,
                          $tool.icon || `ws-${$tool.type}`,
                          $tool.disabled && 'is-disabled'
                        ]}
                        onClick={() => handleToolClick($tool.type)}
                      />
                    )
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }
})
