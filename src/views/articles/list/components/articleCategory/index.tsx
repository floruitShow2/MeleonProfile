import { defineComponent, ref, toRefs } from 'vue'
import type { CategoryEntity } from './interface'
import './index.less'

export default defineComponent({
  props: {
    category: {
      type: String
    }
  },
  emits: ['update:category'],
  setup(props, { emit }) {
    const { category: activeCategory } = toRefs(props)

    const categories = ref<CategoryEntity[]>([
      {
        icon: 'ws-frontend',
        label: '前端'
      },
      {
        icon: 'ws-backend',
        label: '后端'
      }
    ])
    const handleCategoryChange = (item: CategoryEntity) => {
      emit('update:category', item.label)
    }

    return () => (
      <div class="art-category">
        <ul class="art-category--list">
          {categories.value.map((item) => (
            <>
              <li
                class={{
                  'art-category--list-item': true,
                  'art-category--list-item--active': item.label === activeCategory.value
                }}
                onClick={() => handleCategoryChange(item)}
              >
                <i class={`iconfont ${item.icon}`}></i>
                <span>{item.label}</span>
              </li>
            </>
          ))}
        </ul>
      </div>
    )
  }
})
