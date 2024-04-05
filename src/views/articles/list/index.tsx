import { defineComponent, ref } from 'vue'
import ArticleCategory from './components/articleCategory'
import ArticleMain from './components/articleMain'
import ArticleAside from './components/articleAside'
import type { SearchOption } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    const searchOption = ref<SearchOption>({
      category: '前端'
    })
    return () => (
      <div class="art-list">
        <aside class="art-list-aside">
          <ArticleCategory v-model:category={searchOption.value.category} />
        </aside>
        <main class="art-list-main">
          <ArticleMain option={searchOption.value} />
        </main>
        <aside class="art-list-aside">
          <ArticleAside />
        </aside>
      </div>
    )
  }
})
