import { defineComponent, ref } from 'vue'
import { Modal, Input } from '@arco-design/web-vue'
import { useDebounceFn } from '@vueuse/core'
import { localStg } from '@/utils/storage'
import { ConvertToTree, ConvertToSearchFuzzyList } from './type'
import type { FuzzyResultType, FuzzyItemType, RestrictType } from './type'
import './index.less'

export { ConvertToTree, ConvertToSearchFuzzyList, FuzzyItemType, FuzzyResultType, RestrictType }
export default defineComponent({
  props: {
    id: {
      type: String,
      default: 'search'
    },
    fetchFuzzyList: {
      type: Function,
      default: () => {
        return {
          nbHits: 0,
          hits: []
        }
      }
    }
  },
  emits: ['onSelect'],
  setup(props, { emit }) {
    const STORAGE_KEY = `--iot-${props.id}-records` as StorageInterface.SearchRecords

    // 控制 Modal 组件的显示或隐藏
    const isSearchPanelShow = ref(false)

    // 点击搜索结果后更新本地存储
    const storageList = ref<string[]>([])

    const handleSearchPanel = () => {
      const storedRecords = localStg.get(STORAGE_KEY)
      if (!storedRecords) localStg.set(STORAGE_KEY, [])
      else storageList.value = storedRecords
      isSearchPanelShow.value = !isSearchPanelShow.value
    }

    // 根据输入的参数模糊查询结果
    const searchQuery = ref('')
    const mapHits = ref<Record<string, FuzzyItemType[]>>({})
    const hitsCount = ref<number>(0)
    const startSearchFuzzyList = useDebounceFn((query: string) => {
      const { nbHits, hits } = props.fetchFuzzyList(query) as FuzzyResultType
      const map: Record<string, FuzzyItemType[]> = {}
      hits.forEach((hit) => {
        if (map[hit.hierarchy.lvl1]) {
          map[hit.hierarchy.lvl1] = [...map[hit.hierarchy.lvl1], hit]
        } else {
          map[hit.hierarchy.lvl1] = [hit]
        }
      })
      mapHits.value = map
      hitsCount.value = nbHits
    })

    const handleResultClick = (id: string | number | symbol) => {
      isSearchPanelShow.value = false
      const storedRecords = localStg.get(STORAGE_KEY)
      if (storedRecords) {
        localStg.set(STORAGE_KEY, [...new Set([...storedRecords, searchQuery.value])])
      } else localStg.set(STORAGE_KEY, [searchQuery.value])
      emit('onSelect', { id })
    }

    return () => (
      <div>
        <i
          class="iconfont ws-search ibtn_base ibtn_hover ibtn_mini"
          onClick={handleSearchPanel}
        ></i>
        <Modal
          v-model:visible={isSearchPanelShow.value}
          v-slots={{
            title: () => (
              <Input
                v-model={searchQuery.value}
                v-slots={{
                  prefix: () => <i class="iconfont ws-search"></i>
                }}
                size="large"
                onInput={startSearchFuzzyList}
              ></Input>
            ),
            default: () => {
              // 搜索记录
              if (hitsCount.value > 0) {
                return (
                  <div class="search-hit-wrapper">
                    {Object.keys(mapHits.value).map((group) => {
                      return (
                        <div>
                          <div class="search-hit-source">{group}</div>
                          <ul>
                            {mapHits.value[group].map((hit) => {
                              return (
                                <li
                                  class="search-hit"
                                  onClick={() => handleResultClick(hit.objectId)}
                                >
                                  <i class="iconfont ws-clock"></i>
                                  <span
                                    innerHTML={hit.hierarchy[hit.type].replace(
                                      searchQuery.value,
                                      `<mark>${searchQuery.value}</mark>`
                                    )}
                                  ></span>
                                  <div class="tools">
                                    <i class="iconfont ws-navigator"></i>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )
              }
              // 历史搜索记录
              if (storageList.value.length > 0) {
                return (
                  <>
                    <span class="search-hit-source">搜索历史</span>
                    <ul>
                      {storageList.value.map((item) => {
                        return (
                          <li class="search-hit">
                            <i class="iconfont ws-clock"></i>
                            <span>{item}</span>
                            <div class="tools">
                              <i class="iconfont ws-nail"></i>
                              <i class="iconfont ws-close"></i>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )
              }
              // 空状态
              return (
                <div class="search-empty-status">
                  <span>暂无记录</span>
                </div>
              )
            }
          }}
          top={100}
          closable={false}
          align-center={false}
        ></Modal>
      </div>
    )
  }
})
