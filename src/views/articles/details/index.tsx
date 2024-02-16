import { defineComponent, ref, onMounted, computed, nextTick, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { Drawer } from '@arco-design/web-vue'
import WsComments from '@/components/comments'
import { FetchArticleById } from '@/api/articles/center'
import MlMarkdownView from '@/components/markdownView'
import MarkdownTools from './components/markdownTools'
import MarkdownHeader from './components/markdownHeader'
import MarkdownFooter from './components/markdownFooter'
import MarkdownAuthor from './components/markdownAuthor'
import './index.less'

export default defineComponent({
  setup() {
    const route = useRoute()

    // 避免点击 a 标签后跳转到新页面
    onBeforeRouteUpdate((to, from, next) => {
      if (to.path !== from.path) next()
    })

    // 文章实体
    const articleEntity = ref<ApiArticle.ArticleEntity>()
    const authorEntity = ref<ApiAuth.UserInfo>()
    // 获取文章目录
    const mdRef = ref()
    const headings = computed<
      Array<{ tag: string; tagIndex: number; level: number; content: string }>
    >(() => {
      return mdRef.value ? mdRef.value.headings : []
    })
    const activeHeading = ref<string>()

    // 记录所有标题与其距顶部偏移量的映射
    const headingsOffset = ref<Record<number, string>>({})
    const updateHeadingsOffset = () => {
      nextTick(() => {
        activeHeading.value = headings.value[0]?.content ?? ''

        const targetEl = mdRef.value.viewRef
        const headingsEl = Array.from(targetEl.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        headingsEl.forEach((head: any) => {
          headingsOffset.value[head.offsetTop] = head.innerText
        })
      })
    }

    watch(
      headings,
      () => {
        updateHeadingsOffset()
      },
      { deep: true }
    )

    const updateArticle = async () => {
      const { id } = route.params
      const { data } = await FetchArticleById(Array.isArray(id) ? id[0] : id)
      if (!data) return
      const { articleInfo, authorInfo } = data
      articleEntity.value = articleInfo
      authorEntity.value = authorInfo
    }

    onMounted(async () => {
      updateArticle()
    })

    const handleWrapperScroll = (e: UIEvent) => {
      const target = e.target as HTMLElement
      const offsetTop = target.scrollTop
      const offsetList = Object.keys(headingsOffset.value).map((item) => +item)

      if (offsetTop === 0) {
        activeHeading.value = headingsOffset.value[offsetList[0]]
        return
      }

      const lastOffsetTop = offsetList.at(-1)
      if (lastOffsetTop && offsetTop >= lastOffsetTop - 150) {
        activeHeading.value = headingsOffset.value[lastOffsetTop]
        return
      }

      for (let i = 0; i < offsetList.length; i++) {
        if (offsetTop < offsetList[i] - 150) {
          activeHeading.value = headingsOffset.value[offsetList[i - 1]]
          break
        }
      }
    }

    // 评论相关
    const showCommentsDrawer = ref(false)
    const openCommentsDrawer = () => {
      showCommentsDrawer.value = true
    }

    return () => (
      <div class="details">
        <div class="details-wrapper" onScroll={handleWrapperScroll}>
          <div class="details-wrapper_tools">
            <MarkdownTools
              likes={articleEntity.value?.likes}
              liked={articleEntity.value?.liked}
              comments={articleEntity.value?.comments}
              show-comments={showCommentsDrawer.value}
              onLike={updateArticle}
              onComment={openCommentsDrawer}
            />
          </div>
          {articleEntity.value && authorEntity.value && (
            <div class="details-wrapper_main">
              <MarkdownHeader article={articleEntity.value} author={authorEntity.value} />
              <MlMarkdownView ref={mdRef} modelValue={articleEntity.value?.content || ''} />
              <MarkdownFooter article={articleEntity.value} />
            </div>
          )}
          <div class="details-wrapper_sidebar">
            <div class="details-wrapper_sidebar-author">
              {authorEntity.value && <MarkdownAuthor author={authorEntity.value} />}
            </div>
            {/* 文章目录 */}
            <div class="details-wrapper_sidebar-menu">
              {headings.value.map((head) => (
                <a
                  href={`#${head.content}`}
                  class={{
                    'is-active': activeHeading.value === head.content
                  }}
                  style={{
                    paddingLeft: `${head.level * 10 + 20}px`
                  }}
                >
                  {head.content}
                </a>
              ))}
            </div>
          </div>
        </div>
        <Drawer
          v-model:visible={showCommentsDrawer.value}
          width={500}
          footer={false}
          unmountOnClose
          v-slots={{
            title: () => articleEntity.value?.title || ''
          }}
        >
          {articleEntity.value?.blogId && <WsComments target={articleEntity.value?.blogId} />}
        </Drawer>
      </div>
    )
  }
})
