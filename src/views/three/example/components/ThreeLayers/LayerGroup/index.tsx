import { defineComponent, ref, toRefs, nextTick, computed } from 'vue'
import type { PropType } from 'vue'
import { useDeepClone } from '@/utils/format'
import type { RestrictType } from '@/components/search'
import Layer from '../Layer'
import './index.less'

const LayersGroup = defineComponent({
  name: 'LayersGroup',
  props: {
    // 当前分组展示的 layers
    layers: {
      type: Array as PropType<RestrictType[]>,
      required: true
    },
    // 完整的 layers 列表
    totalLayers: {
      type: Array as PropType<RestrictType[]>,
      required: true
    },
    // 隐藏的 layers 分组
    hiddenLayers: {
      type: Array as PropType<Array<string | number | symbol>>,
      default: () => []
    },
    level: {
      type: Number,
      default: 0
    },
    accordion: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { layers, totalLayers, level, accordion, hiddenLayers } = toRefs(props)

    type UUIDType = string | number | symbol

    // 计算父级元素是否处于显示状态
    const computeParentVisible = computed(() => {
      return (id: UUIDType) => {
        const copiedLayers = useDeepClone(totalLayers.value)
        let result: UUIDType[] = []
        function DFS(targetLayers: RestrictType[], target: UUIDType, res: UUIDType[] = []): void {
          for (let i = 0; i < targetLayers.length; i++) {
            const layer = targetLayers[i]
            if (!layer.children) {
              if (layer.id === target) result = [...res, layer.id]
            } else {
              DFS(layer.children, target, [...res, layer.id])
            }
          }
        }
        DFS(copiedLayers, id, result)
        return !hiddenLayers.value.some((item) => result.includes(item))
      }
    })

    const wrapperRef = ref<HTMLElement[]>([])
    const folderRef = ref<HTMLElement[]>([])

    // 处理分组的展开及折叠动画
    const activeFolders = ref<UUIDType[]>([])
    const animateFolder = (type: 'open' | 'close', index: number) => {
      const ele = folderRef.value[index]
      const wrapper = wrapperRef.value[index]
      if (!ele || !wrapper) return
      const { height } = ele.getBoundingClientRect()
      if (type === 'close') {
        wrapper.animate([{ height: `${height}px` }, { height: 0 }], {
          duration: 200,
          easing: 'ease',
          fill: 'both'
        })
      } else {
        wrapper.animate([{ height: 0 }, { height: `${height}px` }], {
          duration: 200,
          easing: 'ease',
          fill: 'both'
        })
      }
    }

    const handleFolderAccordion = (id: UUIDType, index: number) => {
      if (activeFolders.value.length === 0) {
        // 所有部门均处于折叠状态
        activeFolders.value = [id]
        nextTick(() => {
          animateFolder('open', index)
        })
      } else if (activeFolders.value[0] !== id) {
        // 其他部门处于折叠状态
        // const originTitle = activeFolders.value[0]
        animateFolder('close', index)
        activeFolders.value = [id]
        nextTick(() => {
          animateFolder('open', index)
        })
      } else {
        // 展开状态
        activeFolders.value = []
        animateFolder('close', index)
      }
    }

    const handleFolder = (id: UUIDType, type: 'layer' | 'folder', index: number) => {
      if (type !== 'folder') return
      if (accordion.value) {
        handleFolderAccordion(id, index)
        return
      }
      const idx = activeFolders.value.indexOf(id)
      if (idx !== -1) {
        // 展开状态
        activeFolders.value.splice(idx, 1)
        animateFolder('close', index)
      } else {
        // 折叠状态
        activeFolders.value.push(id)
        nextTick(() => {
          animateFolder('open', index)
        })
      }
    }

    return () => (
      <div class="ml-layers-group">
        {layers.value.map((layer, index) => {
          const { label, id, hasChildren, children } = layer
          return !hasChildren ? (
            <Layer
              uuid={id}
              label={label}
              type="layer"
              level={level.value}
              parentLayerVisible={computeParentVisible.value(id)}
            />
          ) : (
            <>
              <Layer
                uuid={id}
                label={label}
                type="folder"
                level={level.value}
                isFold={activeFolders.value.includes(id)}
                parentLayerVisible={computeParentVisible.value(id)}
                onClick={(e) => handleFolder(e.uuid, e.type, index)}
              />
              <div
                ref={(el) => {
                  if (el) wrapperRef.value[index] = el as unknown as HTMLElement
                }}
                class={{
                  'sub-group': true,
                  'is-fold': !activeFolders.value.includes(id)
                }}
              >
                <LayersGroup
                  ref={(el) => {
                    if (el && '$el' in el) {
                      folderRef.value[index] = el.$el as HTMLElement
                    }
                  }}
                  level={level.value + 1}
                  layers={children || []}
                  totalLayers={totalLayers.value}
                  hiddenLayers={hiddenLayers.value}
                />
              </div>
            </>
          )
        })}
      </div>
    )
  }
})

export default LayersGroup
