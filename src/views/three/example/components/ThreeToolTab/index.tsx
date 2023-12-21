import { defineComponent, ref } from 'vue'
import { Dropdown, Doption } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  emits: ['select'],
  setup(props, { emit }) {
    const tabs = ref([
      {
        label: '文件',
        key: 'file',
        options: [
          {
            label: '导入',
            key: 'import'
          }
        ]
      },
      {
        label: '窗口',
        key: 'window',
        options: [
          {
            label: '材质管理器',
            key: 'window-material'
          }
        ]
      }
    ])

    const handleSelect = (value?: string | number | Record<string, any>) => {
      if (!value) return
      emit('select', value)
    }

    return () => (
      <div class="three-tool-tab">
        {tabs.value.map((tab) =>
          tab.options ? (
            <Dropdown
              v-slots={{
                content: () => (
                  <>
                    {tab.options.map((option) => (
                      <Doption value={option.key}>{option.label}</Doption>
                    ))}
                  </>
                )
              }}
              onSelect={handleSelect}
            >
              <div class="tab" key={tab.key}>
                {tab.label}
              </div>
            </Dropdown>
          ) : (
            <div class="tab">{tab.label}</div>
          )
        )}
      </div>
    )
  }
})
