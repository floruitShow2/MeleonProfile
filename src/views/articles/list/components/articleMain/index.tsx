import { PropType, defineComponent, onMounted, ref } from 'vue'
import { FetchArticlesByCategory } from '@/api/articles'
import { useVirtualScroll } from '@/hooks/list'
import WsArtCard from '../articleCard'
import ArticleSwiper from '../articleSwiper'
import './index.less'
import { SearchOption } from '../../interface'

export default defineComponent({
  props: {
    option: {
      type: Object as PropType<SearchOption>
    }
  },
  setup() {
    const activeLabel = ref('recommand')
    const isLoadingArticles = ref(false)
    const categoryLabels = ref<Record<string, string>[]>([
      {
        code: 'recommand',
        label: '推荐'
      },
      {
        code: 'recent',
        label: '最新'
      }
    ])
    const categoryArticles = ref<ApiArticle.ArticleEntity[]>([])

    // 获取当前 tab 下的所有文章
    const fetchArticles = async (label: string) => {
      isLoadingArticles.value = true
      const { data: articles } = await FetchArticlesByCategory(label)
      if (!articles) return
      categoryArticles.value = articles
      isLoadingArticles.value = false
    }
    const onCategoryLabelChange = async (code: string) => {
      // 执行获取文章列表的操作
      activeLabel.value = code
      await fetchArticles(code)
    }

    const wrapperRef = ref()
    const { renderList, itemsRef } = useVirtualScroll(categoryArticles, wrapperRef)

    onMounted(async () => {
      await fetchArticles(activeLabel.value)
    })

    return () => (
      <div class="art-main">
        <div class="art-main-favorite">
          <ArticleSwiper />
        </div>
        <div class="art-main-category">
          <div class="art-main-category-header">
            <ul class="header-labels">
              {categoryLabels.value.map((category) => (
                <div
                  class={{
                    'label-capsule': true,
                    'is-active': activeLabel.value === category.code
                  }}
                  onClick={() => onCategoryLabelChange(category.code)}
                >
                  {category.label}
                </div>
              ))}
            </ul>
          </div>
          <div class="art-main-category-panel" ref={wrapperRef}>
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
      </div>
    )
  }
})
