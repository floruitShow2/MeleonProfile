import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { FetchArticleById } from '@/api/articles/center'
import MlMarkdownView from '@/components/markdownView'
import './index.less'

export default defineComponent({
  setup() {
    const route = useRoute()

    // 文章实体
    const article = ref<ApiArticle.ArticleEntity>()
    // 获取文章目录
    const mdRef = ref()
    const headings = computed<string[]>(() => {
      return mdRef.value ? mdRef.value.headings : []
    })

    onMounted(async () => {
      const id = route.path.split('/').at(-1) || ''
      const { data } = await FetchArticleById(id)
      if (!data) return
      article.value = data
    })

    return () => (
      <div class="details">
        <div class="details-wrapper">
          <div class="details-wrapper_main">
            <MlMarkdownView ref={mdRef} modelValue={article.value?.content || ''} />
          </div>
          <div class="details-wrapper_sidebar">
            {headings.value.map((head) => (
              <>{head}</>
            ))}
          </div>
        </div>
      </div>
    )
  }
})
