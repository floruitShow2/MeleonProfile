import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tabs, TabPane, Input } from '@arco-design/web-vue'
import { useThrottleFn } from '@vueuse/core'
import { FetchArticlesList } from '@/api/articles'
import { formatToDateTime } from '@/utils/format'
import type { ArticleCategoryType } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    type ArticleStatus = 'total' | ApiArticle.ArticleEntity['status']

    const router = useRouter()
    const route = useRoute()

    const searchQuery = ref('')

    const activeKey = ref('article')

    // 文章
    const currentArticlesList = ref<ApiArticle.ArticleEntity[]>([])
    const articlesCategory = computed<ArticleCategoryType[]>(() => {
      const map: Record<ApiArticle.ArticleEntity['status'], ApiArticle.ArticleEntity[]> = {
        published: [],
        inReview: [],
        notPassed: []
      }
      currentArticlesList.value.forEach((item) => {
        map[item.status].push(item)
      })

      return [
        {
          label: '全部',
          code: 'total',
          num: currentArticlesList.value.length,
          list: currentArticlesList.value
        },
        {
          label: '已发布',
          code: 'published',
          num: map.published.length,
          list: map.published
        },
        {
          label: '审核中',
          code: 'inReview',
          num: map.inReview.length,
          list: map.inReview
        },
        {
          label: '未通过',
          code: 'notPassed',
          num: map.notPassed.length,
          list: map.notPassed
        }
      ]
    })
    const activeCategory = ref<ArticleStatus>('total')
    // 更新文章列表
    const updateArticlesList = async () => {
      const { data } = await FetchArticlesList(searchQuery.value)
      if (!data) return
      currentArticlesList.value = data
    }

    onMounted(updateArticlesList)

    const throttleUpdate = useThrottleFn(updateArticlesList, 500)

    const handleArticleClick = (article: ApiArticle.ArticleEntity) => {
      router.push({ path: `/articles/${article.blogId}` })
    }

    const genArticlesItem = (category: ArticleStatus) => {
      const curList = articlesCategory.value.find((item) => item.code === category)
      if (!curList) return []
      return curList.list.map((article) => {
        return (
          <div class="article-card" onClick={() => handleArticleClick(article)}>
            <div class="article-card_header">
              <span>{article.title}</span>
              <i class="iconfont ws-more ibtn_mini ibtn_hover"></i>
            </div>
            <div class="article-card_details">
              <span>{formatToDateTime(article.uploadTime)}</span>
              <span class="split-line"></span>
              <span>{article.views}阅读</span>
              <span class="split-dot">·</span>
              <span>{article.likes}点赞</span>
              <span class="split-dot">·</span>
              <span>{article.comments}评论</span>
            </div>
          </div>
        )
      })
    }

    return () => (
      <div class="article-wrapper">
        <Tabs
          defaultActiveKey={activeKey.value}
          size="medium"
          v-slots={{
            extra: () => (
              <Input
                v-model:modelValue={searchQuery.value}
                size="mini"
                v-slots={{
                  prefix: () => <i class="iconfont ws-search" />
                }}
                onInput={throttleUpdate}
              />
            )
          }}
        >
          <TabPane key="article" title="文章" class="article-wrapper_wrapper">
            <div class="article-wrapper_wrapper-header">
              {articlesCategory.value.map((tab) => {
                return (
                  <div
                    class={{
                      'category-item': true,
                      'is-active': activeCategory.value === tab.code
                    }}
                    onClick={() => {
                      activeCategory.value = tab.code
                    }}
                  >
                    <span>{tab.label}</span>
                    <span>({tab.num})</span>
                  </div>
                )
              })}
            </div>
            <div class="article-wrapper_wrapper-list">{genArticlesItem(activeCategory.value)}</div>
          </TabPane>
          <TabPane key="drafts" title="草稿箱">
            aaa
          </TabPane>
        </Tabs>
      </div>
    )
  }
})
