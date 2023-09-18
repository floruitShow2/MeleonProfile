import { ref, computed, watch } from 'vue'
import type { Ref, ComponentPublicInstance } from 'vue'

// interface UseVirtualScrollOptions {
//   visibleNum: number
// }

type ListItem = Element | ComponentPublicInstance | undefined

// const defaultOptions: UseVirtualScrollOptions = {
//   visibleNum: 10
// }

// 获取目标元素的 DOM 实例，如果是组件则获取它在 $el 里存储的内容
const getItemInstance = (target: ListItem): HTMLElement | undefined => {
  if (!target) return undefined
  return '$el' in target ? target.$el : target
}

const getBoundingRect = (target: ListItem) => {
  const el = getItemInstance(target)
  if (!el) return []
  const { width, height } = el.getBoundingClientRect()
  return [width, height]
}

/**
 * hook for virtual scroll
 * @param list 完整的数据源列表
 * @param rootRef 虚拟列表的容器节点
 * @param options hook 的一些配置选项
 * @returns {
 *  renderList 当前渲染的数据片段
 *  itemsRef 数据片段渲染出来的节点信息，需要通过 ref 绑定到虚拟列表的节点上
 * }
 */
export default function useVirtualScroll<T>(list: Ref<T[]>, rootRef: Ref<HTMLElement | undefined>) {
  const startIdx = ref(0)

  const itemsRef = ref<Array<ListItem>>([])
  const firstItem = ref<ListItem>()
  const lastItem = ref<ListItem>()

  const computedNums = computed(() => {
    const firstEl = getItemInstance(firstItem.value)
    const [w, h] = getBoundingRect(firstEl)
    const [wrapperW, wrapperH] = getBoundingRect(rootRef.value)
    const rows = Number.isNaN(Math.floor(wrapperH / h) + 2) ? 4 : Math.floor(wrapperH / h) + 2
    const columns = Number.isNaN(Math.floor(wrapperW / w)) ? 5 : Math.floor(wrapperW / w)
    return {
      rows,
      columns,
      total: rows * columns
    }
  })

  const renderList = computed(() => {
    return list.value.slice(startIdx.value, startIdx.value + computedNums.value.total)
  })

  // intersection 监听节点与视口交互
  const cb: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      const first = firstItem.value && getItemInstance(firstItem.value)
      const last = lastItem.value && getItemInstance(lastItem.value)
      if (entry.target === first) {
        if (entry.isIntersecting && startIdx.value >= computedNums.value.columns) {
          startIdx.value -= computedNums.value.columns
          startIdx.value = startIdx.value < 0 ? 0 : startIdx.value
        }
      } else if (entry.target === last) {
        if (
          entry.isIntersecting &&
          startIdx.value <=
            list.value.length - computedNums.value.total - computedNums.value.columns
        ) {
          startIdx.value += computedNums.value.columns
        }
      }
    })
  }
  const intersectionOptions: IntersectionObserverInit = {
    root: rootRef.value,
    threshold: 0.75
  }
  const observer = new IntersectionObserver(cb, intersectionOptions)

  watch(
    itemsRef,
    (newVal) => {
      if (!newVal) return
      const first = newVal[0]
      const firstEl = getItemInstance(first)
      const last = newVal[renderList.value.length - 1]
      const lastEl = getItemInstance(last)
      lastItem.value = last
      firstItem.value = first
      if (first && firstEl) observer.observe(firstEl)
      if (last && lastEl) observer.observe(lastEl)
    },
    { deep: true }
  )

  // 保证 itemsRef 和 renderList 的长度始终保持一致
  watch(renderList, (newVal) => {
    itemsRef.value = itemsRef.value.splice(0, newVal.length)
  })
  return {
    renderList,
    itemsRef
  }
}
