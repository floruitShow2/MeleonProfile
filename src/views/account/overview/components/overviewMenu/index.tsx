import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/auth'
import { Button, Result } from '@arco-design/web-vue'
import type { OverviewType } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    const router = useRouter()

    const userState = ref<ApiAuth.UserInfo & OverviewType>()

    const userStatistics = ref<Record<string, number>>({
      articles: 0,
      // 浏览数
      views: 0,
      // 点赞数
      likes: 0,
      // 不喜欢
      dislikes: 0,
      // 收藏数
      collects: 0,
      // 评论数
      comments: 0
    })

    const initUserInfo = async () => {
      const { data } = await getUserInfo()
      if (data) {
        userState.value = {
          ...data,
          followers: 0,
          followees: 0,
          articles: 0
        }
      }
    }

    onMounted(initUserInfo)

    // recent files
    const recentArticles = ref<any[]>([])

    const handleEmptyBtnClick = () => {
      router.push({
        path: '/articles/editor'
      })
    }

    const generateRecentComponent = () => {
      if (recentArticles.value.length === 0) {
        return (
          <div class="recent-content-empty">
            <Result class="result" status="404" subtitle="尚未发布任何内容" />
            <Button type="primary" size="medium" onClick={handleEmptyBtnClick}>
              立即创作
            </Button>
          </div>
        )
      }
      return (
        <div class="recent-content-articles">
          {recentArticles.value.map((item) => (
            <div>{item}</div>
          ))}
        </div>
      )
    }

    // search ranking
    const searchRank = ref([
      {
        title: 'Title 1',
        involves: 1234,
        views: 5678
      }
    ])

    return () =>
      userState.value && (
        <div class="article-overview">
          <div class="article-overview-wrapper">
            <div class="card profile">
              <img class="profile-avatar" src={userState.value.avatar} alt="" />
              <div class="profile-message">
                <h4>{userState.value.username}</h4>
                <ul>
                  <li>{userState.value.followers} followers</li>
                  <li>{userState.value.followees} followees</li>
                  <li>{userState.value.articles} articles</li>
                </ul>
              </div>
            </div>
            <div class="card statistics">
              <div class="card-title">
                <span>数据概览</span>
                <div class="view-all">
                  查看更多<i class="iconfont ws-arrow-right"></i>
                </div>
              </div>
              <div class="statistics-content">
                {Object.keys(userStatistics.value).map((k) => (
                  <div class="statistics-content-item">
                    <span class="title">{k}</span>
                    <span class="data">{userStatistics.value[k]}</span>
                    <span class="rate">较前日 --</span>
                  </div>
                ))}
              </div>
            </div>
            <div class="card recent">
              <div class="card-title">
                <span>近期发布</span>
              </div>
              <div class="recent-content">{generateRecentComponent()}</div>
            </div>
          </div>
          <div class="article-overview-aside">
            <div class="card">
              <div class="card-title">
                <span>创作话题</span>
                <div class="view-all">
                  查看更多<i class="iconfont ws-arrow-right"></i>
                </div>
              </div>
              <div class="search-ranking">
                {searchRank.value.map((item) => (
                  <div class="search-ranking-item">
                    <div class="title"># {item.title} #</div>
                    <div class="content">
                      <span>{item.involves} 参与</span>
                      <span>{item.views} 阅读</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
  }
})
