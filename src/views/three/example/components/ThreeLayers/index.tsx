import { defineComponent, nextTick, onMounted, ref } from 'vue'
import WsSearch, {
  ConvertToTree,
  ConvertToSearchFuzzyList,
  RestrictType,
  FuzzyResultType
} from '@/components/search'
import { Skeleton, SkeletonLine, SkeletonShape, Space } from '@arco-design/web-vue'
import LayersGroup from './LayerGroup'
import Experience from '../../General/Experience'
import './index.less'

export default defineComponent({
  props: {
    experience: {
      type: Experience,
      required: true
    }
  },
  setup() {
    let experience: null | Experience = null
    const tabs = [
      {
        key: 'layers',
        label: '图层'
      },
      {
        key: 'waiting',
        label: '待定'
      }
    ]
    const activeTab = ref<string>('layers')
    // 图层管理
    const layers = ref<RestrictType[]>([])
    const setLayers = () => {
      if (!experience) return
      layers.value = ConvertToTree(experience.world.room.layers)
    }

    onMounted(() => {
      experience = new Experience()
      nextTick(() => {
        if (!experience) return
        experience.world.on('worldready', () => {
          setLayers()
        })
      })
    })

    const FuzzyLayersList = (query: string): FuzzyResultType => {
      if (!query.length) {
        return {
          hits: [],
          nbHits: 0
        }
      }

      return ConvertToSearchFuzzyList(layers.value, query)
    }

    return () => (
      <div class="three-layers">
        <div class="three-layers-tools">
          <div class="tabs">
            {tabs.map((tab) => (
              <div
                class={['tab', tab.key === activeTab.value && 'is-active']}
                onClick={() => {
                  activeTab.value = tab.key
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <WsSearch id="three-layers" fetchFuzzyList={FuzzyLayersList} />
        </div>
        <div class="three-layers-group">
          {layers.value.length ? (
            <LayersGroup totalLayers={layers.value} layers={layers.value} />
          ) : (
            <Skeleton animation>
              {new Array(5).fill(0).map(() => (
                <div class="skeleton-item">
                  <SkeletonShape size="small" />
                  <SkeletonLine lineHeight={24} />
                </div>
              ))}
            </Skeleton>
          )}
        </div>
      </div>
    )
  }
})
