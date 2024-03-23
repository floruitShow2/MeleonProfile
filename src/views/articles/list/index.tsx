import { defineComponent, onMounted, reactive, ref } from 'vue'
import { FetchCategory, FetchArticlesByCategory, FetchArticleRankList } from '@/api/articles'
import { useVirtualScroll } from '@/hooks/list'
import { Pagination } from '@arco-design/web-vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import WsArtCard from './components/articleCard'
import ArticleAside from './components/articleAside'
import './index.less'
import 'swiper/css'

export default defineComponent({
  setup() {
    // swiper
    const swiperList = ref<string[]>(['slide1', 'slide2', 'slide3'])
    const swiperRef = ref()
    const onSwiperNextClick = () => {
      swiperRef.value.$el.swiper.slideNext()
    }
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
            <div class="art-favorite-swiper">
              <Swiper ref={swiperRef} slides-per-view={1} space-between={50}>
                {swiperList.value.map((slide) => (
                  <SwiperSlide>{slide}</SwiperSlide>
                ))}
              </Swiper>
              <i class="iconfont ws-arrow-right" onClick={onSwiperNextClick} />
            </div>
            {/* <div class="art-favorite-pagination">
              <div class="list">
                <div class="list-content">
                  {articleRankList.value.map((li) => (
                    <WsArtCard
                      type="horizontal"
                      key={li.title}
                      details={li}
                      v-slots={{
                        image: () => <img src={li.cover} />
                      }}
                    />
                  ))}
                </div>
              </div>
              <Pagination
                v-model:current={paginationConfig.page}
                total={25}
                page-size={paginationConfig.pageSize}
              />
            </div> */}
          </div>
          <div class="art-category">
            <div class="art-category-labels">
              {categoryLabels.value.map((label) => (
                <div
                  class={{ 'label-capsule': true, 'is-active': activeLabel.value === label }}
                  onClick={() => onCategoryLabelChange(label)}
                >
                  {label}
                </div>
              ))}
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
