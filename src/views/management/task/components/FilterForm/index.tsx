import { defineComponent, ref } from 'vue'
import { Input, Select, Option, DatePicker, Button } from '@arco-design/web-vue'
import { StaticTags } from '@/constants/tag'
import './index.less'

export default defineComponent({
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const options = ref<ApiTask.SearchOptions>({
      title: '',
      tags: [],
      startDate: '',
      endDate: ''
    })

    const handleFormCancel = () => {
      emit('cancel')
    }
    const handleFormConfirm = () => {
      emit('confirm', options.value)
    }
    return () => (
      <div class="filter-panel">
        <div class="filter-form">
          <div class="filter-form-item">
            <span class="filter-form-item--title">任务名称</span>
            <Input v-model:modelValue={options.value.title} placeholder="请输入任务名称" />
          </div>
          <div class="filter-form-item">
            <span class="filter-form-item--title">任务标签</span>
            <Select v-model:modelValue={options.value.tags} multiple placeholder="请选择">
              {StaticTags.map((tag) => (
                <Option value={tag.code}>{tag.label}</Option>
              ))}
            </Select>
          </div>
          <div class="filter-form-item">
            <span class="filter-form-item--title">起始日期</span>
            <DatePicker v-model:modelValue={options.value.startDate} />
          </div>
          <div class="filter-form-item">
            <span class="filter-form-item--title">结束日期</span>
            <DatePicker v-model:modelValue={options.value.endDate} />
          </div>
        </div>
        <div class="filter-footer">
          <Button type="secondary" size="medium" onClick={handleFormCancel}>
            取消
          </Button>
          <Button type="primary" size="medium" onClick={handleFormConfirm}>
            确认
          </Button>
        </div>
      </div>
    )
  }
})
