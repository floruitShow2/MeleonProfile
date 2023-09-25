import { defineComponent, onMounted, ref } from 'vue'
import { Tabs, TabPane, Input } from '@arco-design/web-vue'
import { FetchArticles } from '@/api/articles'
import './index.less'

export default defineComponent({
  setup() {
    const searchQuery = ref('')

    const activeKey = ref('article')
    onMounted(async () => {
      const res = await FetchArticles(activeKey.value, searchQuery.value)
      console.log(res)
    })

    return () => (
      <div class="article-management">
        <Tabs
          defaultActiveKey={activeKey.value}
          v-slots={{
            extra: () => (
              <Input
                v-model:modelValue={searchQuery.value}
                size="mini"
                v-slots={{
                  prefix: () => <i class="iconfont ws-search" />
                }}
              />
            )
          }}
        >
          <TabPane key="article" title="文章"></TabPane>
          <TabPane key="drafts" title="草稿箱"></TabPane>
        </Tabs>
      </div>
    )
  }
})
