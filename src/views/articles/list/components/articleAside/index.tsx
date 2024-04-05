import { defineComponent, ref, onMounted } from 'vue'
import { Avatar } from '@arco-design/web-vue'
import IconArtRank from '@/assets/images/articles/icon-art-rank.png'
import IconArtAuthor from '@/assets/images/articles/icon-art-author.png'
import ArticleBlock from '../articleBlock'
import type { TopicType } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    // authors
    const authors = ref([
      {
        avatar: 'http://127.0.0.1:3000/static/files/meleon/avatar/kanban method-rafiki.png',
        username: 'meleon',
        introduction: 'this is my personal introduction'
      },
      {
        avatar: 'http://127.0.0.1:3000/static/files/meleon/avatar/kanban method-rafiki.png',
        username: 'meleon',
        introduction: 'this is my personal introduction'
      },
      {
        avatar: 'http://127.0.0.1:3000/static/files/meleon/avatar/kanban method-rafiki.png',
        username: 'meleon',
        introduction: 'this is my personal introduction'
      },
      {
        avatar: 'http://127.0.0.1:3000/static/files/meleon/avatar/kanban method-rafiki.png',
        username: 'meleon',
        introduction: 'this is my personal introduction'
      },
      {
        avatar: 'http://127.0.0.1:3000/static/files/meleon/avatar/kanban method-rafiki.png',
        username: 'meleon',
        introduction: 'this is my personal introduction'
      }
    ])

    // categories
    const formattedTopics = ref<TopicType[]>([])
    const initTopics = (topics: string[]) => {
      formattedTopics.value = topics.map((item) => ({
        label: item,
        code: item,
        isSelected: false
      }))
    }

    // rank
    const articlesRank = ref<string[]>([
      '没想到三天10KStar的营销利器MediaCrawler开源作者已经删库了',
      '一个排查了一天的BUG，你在摸鱼🐟吧！',
      '我改进了数据滚动方式！老板直接加薪',
      '面经：给你300一天，你来不来？已offer',
      '还在用tinypng？过时了！'
    ])

    const handleTopicsClick = (item: TopicType, index: number) => {
      formattedTopics.value[index].isSelected = !item.isSelected
    }

    onMounted(() => {
      const topics = ['Coding', 'NFT', 'Web 3.0', 'Crypto', 'Design', 'Vue', 'React']
      initTopics(topics)
    })

    return () => (
      <div class="article-aside">
        {/* recommand topics */}
        <ArticleBlock
          class="article-aside_authors"
          v-slots={{
            title: () => (
              <div class="article-aside_rank-title">
                <img src={IconArtAuthor} alt="" />
                <span>文章榜</span>
              </div>
            )
          }}
        >
          <ul class="article-aside_authors-list">
            {authors.value.map((author) => (
              <li>
                <div class="author-details">
                  <Avatar imageUrl={author.avatar} size={28}></Avatar>
                  <div class="author-details-msg">
                    <span class="title">{author.username}</span>
                    <span class="description">{author.introduction}</span>
                  </div>
                </div>
                <span class="author-follow">关注+</span>
              </li>
            ))}
          </ul>
        </ArticleBlock>
        {/* top categories */}
        <div class="article-aside_topics">
          <h4>TOP CATEGORIES</h4>
          <ul>
            {formattedTopics.value.map((item, index) => (
              <li
                class={{
                  'article-aside_topics-item': true,
                  'article-aside_topics-item--active': item.isSelected
                }}
                onClick={() => handleTopicsClick(item, index)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        {/* articles rank */}
        <ArticleBlock
          class="article-aside_rank"
          v-slots={{
            title: () => (
              <div class="article-aside_rank-title">
                <img src={IconArtRank} alt="" />
                <span>文章榜</span>
              </div>
            )
          }}
        >
          <ul class="article-aside_rank-list">
            {articlesRank.value.map((item, index) => (
              <li>
                <span>{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ArticleBlock>
      </div>
    )
  }
})
