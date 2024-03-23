import { defineComponent, ref, onMounted, computed } from 'vue'
import { Avatar } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import IconArtRank from '@/assets/images/articles/icon-art-rank.png'
import type { TopicType } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    const userInfo = computed(() => userStore.userInfo)

    // topics
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
      const topics = ['Coding', 'NFT', 'Web 3.0', 'Crypto', 'Design']
      initTopics(topics)
    })

    return () => (
      <div class="article-aside">
        {/* user info */}
        <div class="article-aside_info">
          <div class="article-aside_info-wrapper">
            <Avatar size={55} imageUrl={userInfo.value.avatar}></Avatar>
            <div class="article-aside_info-wrapper-details">
              <h4>{userInfo.value.username}</h4>
              <p>
                <span>{userInfo.value.job}</span>
                <span>{userInfo.value.introduction}</span>
              </p>
            </div>
          </div>
          <p class="article-aside_info-intro">
            Let me help you integrate into the “New World” and show you cool features that you may
            not know. I love to write about Programming, Productivity and Web 3.0
          </p>
        </div>
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
        <div class="article-aside_rank">
          <h4>ARTICLES RANK</h4>
          <div class="article-aside_rank-header">
            <div class="header-item">
              <img src={IconArtRank} alt="" />
              <span>文章榜</span>
            </div>
            <div class="header-item">
              <i class="iconfont ws-reset"></i>
              <span>换一换</span>
            </div>
          </div>
          <ul class="article-aside_rank-list">
            {articlesRank.value.map((item, index) => (
              <li>
                <span>{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div class="article-aside_rank-footer">
            <span>查看更多</span>
            <i class="iconfont ws-arrow-right"></i>
          </div>
        </div>
      </div>
    )
  }
})
