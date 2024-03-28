import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Select, Option } from '@arco-design/web-vue'
import { IconDown } from '@arco-design/web-vue/es/icon'
import { FetchCategory, FetchArticlesByCategory, FetchArticleRankList } from '@/api/articles'
import { useVirtualScroll } from '@/hooks/list'
import WsArtCard from './components/articleCard'
import ArticleSwiper from './components/articleSwiper'
import ArticleAside from './components/articleAside'
import './index.less'

export default defineComponent({
  setup() {
    // favorites
    const rankCondition = ref('day')
    const paginationConfig = reactive({
      page: 1,
      pageSize: 5
    })
    const articleRankList = ref<ApiArticle.ArticleEntity[]>([])
    const fetchRankList = async () => {
      const { data } = await FetchArticleRankList(
        rankCondition.value,
        paginationConfig.page,
        paginationConfig.pageSize
      )
      if (data) articleRankList.value = data
    }

    // category
    const activeLabel = ref('label1')
    const isLoadingArticles = ref(false)
    const categoryLabels = ref<string[]>([])
    const categoryArticles = ref<ApiArticle.ArticleEntity[]>([])
    // 获取文章列表 tab
    const fetchCategory = async () => {
      const { data: categories } = await FetchCategory()
      if (!categories) return
      categoryLabels.value = categories
      const defaultActive = categories[0]
      activeLabel.value = defaultActive
    }
    // 获取当前 tab 下的所有文章
    const fetchArticles = async (label: string) => {
      isLoadingArticles.value = true
      const { data: articles } = await FetchArticlesByCategory(label)
      if (!articles) return
      categoryArticles.value = articles
      isLoadingArticles.value = false
    }
    const onCategoryLabelChange = async (label: string) => {
      // 执行获取文章列表的操作
      activeLabel.value = label
      await fetchArticles(label)
    }

    const curSort = ref<string>('publishTime-ast')
    const sortOptions = [
      {
        field: 'publishTime',
        code: 'publishTime-ast',
        label: 'Recent',
        order: 'ast'
      },
      {
        field: 'views',
        code: 'views-ast',
        label: 'Popular',
        order: 'ast'
      }
    ]

    const wrapperRef = ref()

    onMounted(async () => {
      await fetchRankList()
      await fetchCategory()
      await fetchArticles(activeLabel.value)
    })

    const { renderList, itemsRef } = useVirtualScroll(categoryArticles, wrapperRef)

    return () => (
      <div class="art-list">
        <main class="art-list-main">
          <div class="art-favorite">
            <ArticleSwiper />
          </div>
          <div class="art-category">
            <div class="art-category-header">
              <ul class="header-labels">
                {categoryLabels.value.map((label) => (
                  <div
                    class={{ 'label-capsule': true, 'is-active': activeLabel.value === label }}
                    onClick={() => onCategoryLabelChange(label)}
                  >
                    {label}
                  </div>
                ))}
              </ul>
              <Select
                v-model:modelValue={curSort.value}
                class="header-sort"
                v-slots={{
                  default: () => (
                    <>
                      {sortOptions.map((option) => (
                        <Option value={option.code} label={option.label}></Option>
                      ))}
                    </>
                  )
                }}
              ></Select>
            </div>
            <div class="art-category-panel" ref={wrapperRef}>
              {!isLoadingArticles.value
                ? renderList.value.map((item, idx) => (
                    <WsArtCard
                      ref={(el) => {
                        if (itemsRef.value && el) itemsRef.value[idx] = el
                      }}
                      key={item.title}
                      class="ws-art-card"
                      details={item}
                      v-slots={{
                        image: () => <img src={item.cover} />
                      }}
                    ></WsArtCard>
                  ))
                : ''}
            </div>
          </div>
        </main>
        <aside class="art-list-aside">
          <ArticleAside />
        </aside>
      </div>
    )
  }
})
