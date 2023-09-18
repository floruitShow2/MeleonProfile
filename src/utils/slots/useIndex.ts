import { computed, onMounted, onUpdated, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { isUndefined } from './useIs'

/**
 *
 * @param itemRef 获取该 DOM 节点在其父节点的 childrenNodes 下的索引
 * @param selector 选择器，itemRef 的 class 类名
 * @param index 指定 index，设置后 itemRef 的索引固定为指定的值
 * @returns {
 *  computedIndex: ComputedRef<number>
 * }
 */
export const useIndex = (payload: {
  itemRef: Ref<HTMLElement | undefined>
  selector: string
  index?: Ref<number>
  parentClassName?: string
}) => {
  const { itemRef, selector, index, parentClassName } = payload
  const $index = ref(-1)
  const computedIndex = computed(() => {
    const pl: number | undefined = index ? index.value : undefined
    return pl || $index.value
  })

  const parent = ref<HTMLElement | null>()
  const getParent = () => {
    let parentBackup = itemRef.value ? itemRef.value.parentElement : null
    if (parentBackup && parentClassName) {
      while (parentBackup && !parentBackup.className.includes(parentClassName)) {
        if (parentBackup.parentElement) {
          parentBackup = parentBackup.parentElement
        }
      }
    }
    return parentBackup
  }
  const getIndex = () => {
    if (isUndefined(index && index.value) && parent.value && itemRef.value) {
      const indexBackup = Array.from(parent.value.querySelectorAll(selector)).indexOf(itemRef.value)
      $index.value = indexBackup === $index.value ? $index.value : indexBackup
    }
  }

  watch(itemRef, () => {
    if (itemRef.value && !parent.value) parent.value = getParent()
  })

  onMounted(() => {
    if (itemRef.value && !parent.value) parent.value = getParent()
    getIndex()
  })

  onUpdated(getIndex)

  return { computedIndex }
}
