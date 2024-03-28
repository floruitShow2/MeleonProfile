import { defineComponent, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { getAssetsFile } from '@/utils/file'
import type { ArticleSwiperEntity } from '@/views/articles/list/interface'
import 'swiper/css'
import './index.less'

export default defineComponent({
  setup() {
    // swiper
    const swiperList = ref<ArticleSwiperEntity[]>([
      {
        title: 'A paradise-like place',
        description: 'Welcome to one of the most amazing places on planet earth.',
        cover: getAssetsFile('../../assets/images/articles/blog-slide-1.jpg'),
        views: 5988,
        comments: 235
      },
      {
        title: 'My experience from a hotel',
        description: 'How me and my company experienced the 5-star hotel experience.',
        cover: getAssetsFile('../../assets/images/articles/blog-slide-2.jpg'),
        views: 5988,
        comments: 235
      },
      {
        title: 'Straight from Mexico',
        description: 'My roadtrip to Mexico and how it felt.',
        cover: getAssetsFile('../../assets/images/articles/blog-slide-3.jpg'),
        views: 5988,
        comments: 235
      }
    ])
    const swiperRef = ref()
    const onSwiperNextClick = () => {
      swiperRef.value.$el.swiper.slideNext()
    }
    return () => (
      <div class="article-swiper">
        <Swiper ref={swiperRef} slides-per-view={1} space-between={50}>
          {swiperList.value.map((slide) => (
            <SwiperSlide>
              <div
                class="swiper-slide-item"
                style={{
                  background: `url("${slide.cover}")`,
                  backgroundSize: 'cover'
                }}
              >
                <div class="swiper-slide-item--msg">
                  <h4>{slide.title}</h4>
                  <p>{slide.description}</p>
                  <ul class="count-list">
                    <li class="count-list-item">
                      <i class="iconfont ws-view"></i>
                      <span>{slide.views}</span>
                      <span>Views</span>
                    </li>
                    <li class="count-list-item">
                      <i class="iconfont ws-chat"></i>
                      <span>{slide.comments}</span>
                      <span>Comments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <i class="iconfont ws-arrow-right" onClick={onSwiperNextClick} />
      </div>
    )
  }
})
