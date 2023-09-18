import { defineComponent } from 'vue'
import { Button } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import WsNodeTemplate from '../tempalte/index'
import './index.less'

export default defineComponent({
  setup() {
    const { t } = useI18n()
    return () => (
      <div class="ws-code-node">
        <WsNodeTemplate
          title="代码编辑器"
          v-slots={{
            default: () => (
              <div class="ws-code-node_content">
                <Button type="primary">Code Button</Button>
              </div>
            )
          }}
        />
      </div>
    )
  }
})
