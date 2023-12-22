import { defineComponent, ref, computed } from 'vue'
import { Select, Option, Dropdown, Doption, Drawer } from '@arco-design/web-vue'
import FilterForm from '../FilterForm'
import type { TaskFilterOptions } from '../../interface'
import type { HiddenFields } from '../taskCard/interface'
import './index.less'

export default defineComponent({
  emits: ['change'],
  setup(props, { emit }) {
    // 切换排布模式
    type ModeType = 'card' | 'table'
    const displayMode = ref<Record<string, string>[]>([
      {
        type: 'table',
        label: '表格视图',
        icon: 'ws-template'
      },
      {
        type: 'card',
        label: '卡片视图',
        icon: 'ws-node'
      }
    ])
    const activeMode = ref<ModeType>('card')

    // 卡片显示内容
    const mapContentFields = ref<Record<HiddenFields, string>>({
      keywords: '关键词',
      tool: '按钮',
      title: '标题',
      description: '描述',
      relatives: '相关人',
      reports: '周报数量'
    })
    const contentSet = ref<HiddenFields[]>([])
    const onContentSetSelect = (value: string | number | Record<string, any> | undefined) => {
      const selected = (value || '').toString() as HiddenFields
      const findIdx = contentSet.value.findIndex((field) => field === selected)
      if (findIdx !== -1) {
        contentSet.value.splice(findIdx, 1)
      } else {
        contentSet.value.push(selected)
      }
    }

    // 筛选功能
    const filterDrawerShow = ref(false)

    const filterOptions = computed<TaskFilterOptions>(() => {
      return {
        activeMode: activeMode.value
      }
    })
    const handleActiveModeChange = () => {
      emit('change', filterOptions.value)
    }

    return () => (
      <>
        <header class="task-manage-header">
          <div class="select-controller">
            <Select
              v-model:modelValue={activeMode.value}
              size="mini"
              onChange={handleActiveModeChange}
              v-slots={{
                default: () =>
                  displayMode.value.map((mode) => (
                    <Option key={mode.type} value={mode.type} label={mode.label} />
                  )),
                label: (scope: any) => (
                  <div class="arco-select-label">
                    <i
                      class={[
                        'iconfont',
                        `ws-${scope.data.value === 'table' ? 'template' : 'node'}`
                      ]}
                    ></i>
                    {scope.data.label}
                  </div>
                )
              }}
            />
          </div>
          <Dropdown
            hide-on-select={false}
            v-slots={{
              default: () => (
                <div class="controller">
                  <i class="iconfont ws-set" />
                  <span>内容配置</span>
                </div>
              ),
              content: () =>
                Object.keys(mapContentFields.value).map((field) => (
                  <Doption
                    value={field}
                    v-slots={{
                      default: () => mapContentFields.value[field as HiddenFields],
                      icon: () => (
                        <i
                          class={[
                            'iconfont',
                            contentSet.value.includes(field as HiddenFields)
                              ? 'ws-unview'
                              : 'ws-view'
                          ]}
                        />
                      )
                    }}
                  />
                ))
            }}
            onSelect={onContentSetSelect}
          />
          <div
            class="controller"
            onClick={() => {
              filterDrawerShow.value = true
            }}
          >
            <i class="iconfont ws-filter" />
            <span>筛选</span>
          </div>
          <div class="controller">
            <i class="iconfont ws-sort" />
            <span>排序</span>
          </div>
          <div class="controller">
            <i class="iconfont ws-search" />
            <span>搜索</span>
          </div>
        </header>
        {/* 筛选弹窗 */}
        <Drawer v-model:visible={filterDrawerShow.value} width={500} footer={false} title="筛选">
          <FilterForm />
        </Drawer>
      </>
    )
  }
})
