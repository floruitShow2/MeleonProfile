import { defineComponent } from 'vue'
import { Input } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  setup() {
    return () => (
      <div class="filter-form">
        <div class="filter-form-header">筛选条件</div>
        <div class="filter-form-form"></div>
      </div>
    )
  }
})
