import { defineComponent, ref } from 'vue'
import { Modal, Input } from '@arco-design/web-vue'
import { useDebounceFn } from '@vueuse/core'
import { ConvertToTree, ConvertToSearchFuzzyList, ConvertToRestrictList } from './type'
import type { FuzzyResultType, FuzzyItemType, RestrictType, StoreRecordType } from './type'
import './index.less'

export { ConvertToTree, ConvertToRestrictList, ConvertToSearchFuzzyList }
export type { FuzzyItemType, FuzzyResultType, RestrictType, StoreRecordType }
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
  emits: ['select'],
  setup(props, { emit }) {
    const STORAGE_KEY = `--iot-${props.id}-records` as StorageInterface.SearchRecords

    // 控制 Modal 组件的显示或隐藏
    const isSearchPanelShow = ref(false)

    // 点击搜索结果后更新本地存储
    const storageList = ref<StoreRecordType[]>([])
    const handleStoreList = (list?: StoreRecordType[]) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || storageList.value))
    }
    const handleSortList = () => {
      storageList.value.sort((a, b) => Number(a.isPinned) - Number(b.isPinned))
      // handleStoreList()
    }

    const handleSearchPanel = () => {
      const storedRecords = localStorage.getItem(STORAGE_KEY)
      if (!storedRecords) handleStoreList([])
      else storageList.value = JSON.parse(storedRecords)
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

    // 点击查询结果
    const handleResultClick = (hit: FuzzyItemType) => {
      const { objectId, type, hierarchy } = hit
      // 关闭弹窗
      isSearchPanelShow.value = false
      searchQuery.value = ''
      startSearchFuzzyList(searchQuery.value)
      // 存储搜索记录
      const storeObject: StoreRecordType = {
        value: hierarchy[type],
        isPinned: false
      }
      const storedRecords = localStorage.getItem(STORAGE_KEY)
      const parsedRecords: StoreRecordType[] = storedRecords ? JSON.parse(storedRecords) : []
      const findRecord = parsedRecords.find((record) => record.value === storeObject.value)
      if (!findRecord) parsedRecords.push(storeObject)
      handleStoreList(parsedRecords)
      // 发射 select 事件
      emit('select', { id: objectId })
    }

    const pinHistoryRecord = (e: MouseEvent, item: StoreRecordType) => {
      e.stopPropagation()
      const findIdx = storageList.value.findIndex((li) => li.value === item.value)
      if (findIdx !== -1) {
        storageList.value.splice(findIdx, 1, { value: item.value, isPinned: !item.isPinned })
      }
      handleSortList()
      handleStoreList()
    }
    const closeHistoryRecord = (e: MouseEvent, item: StoreRecordType) => {
      e.stopPropagation()
      const findIdx = storageList.value.findIndex((li) => li.value === item.value)
      if (findIdx !== -1) {
        storageList.value.splice(findIdx, 1)
      }
      handleStoreList()
    }
    const handleRecordItemClick = (item: StoreRecordType) => {
      searchQuery.value = item.value
      startSearchFuzzyList(searchQuery.value)
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
                                <li class="search-hit" onClick={() => handleResultClick(hit)}>
                                  <i class="iconfont ws-clock"></i>
                                  <span
                                    innerHTML={hit.hierarchy[hit.type].replace(
                                      searchQuery.value,
                                      `<mark>${searchQuery.value}</mark>`
                                    )}
                                  />
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
                  <div class="search-hit-wrapper">
                    <span class="search-hit-source">搜索历史</span>
                    <ul>
                      {storageList.value.map((item) => {
                        return (
                          <li class="search-hit" onClick={() => handleRecordItemClick(item)}>
                            <i class="iconfont ws-clock"></i>
                            <span>{item.value}</span>
                            <div class="tools">
                              <i
                                class={['iconfont ws-nail', item.isPinned && 'is-pinned']}
                                onClick={(e) => pinHistoryRecord(e, item)}
                              ></i>
                              {!item.isPinned && (
                                <i
                                  class="iconfont ws-close"
                                  onClick={(e) => closeHistoryRecord(e, item)}
                                ></i>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
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
        />
      </div>
    )
  }
})
