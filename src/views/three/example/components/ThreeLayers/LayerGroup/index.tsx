import { defineComponent, ref, toRefs, nextTick } from 'vue'
import type { PropType } from 'vue'
import { useDeepClone } from '@/utils/format'
import type { RestrictType } from '@/components/search'
import Layer from '../Layer'
import './index.less'

const LayersGroup = defineComponent({
  name: 'LayersGroup',
  props: {
    layers: {
      type: Array as PropType<RestrictType[]>,
      required: true
    },
    totalLayers: {
      type: Array as PropType<RestrictType[]>,
      required: true
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
    const { layers, totalLayers, level, accordion } = toRefs(props)

    const activeFolders = ref<string[]>([])
    const hiddenFolders = ref<string[]>([])

    const computeParentVisible = (label: string) => {
      const copiedLayers = useDeepClone(totalLayers.value)
      let result: string[] = []
      function DFS(targetLayers: RestrictType[], target: string, res: string[] = []): void {
        for (let i = 0; i < targetLayers.length; i++) {
          const layer = targetLayers[i]
          if (!layer.children) {
            if (layer.label === target) result = [...res, layer.label]
          } else {
            DFS(layer.children, target, [...res, layer.label])
          }
        }
      }
      DFS(copiedLayers, label, result)
      return !hiddenFolders.value.some((item) => result.includes(item))
    }

    const wrapperRef = ref<HTMLElement[]>([])
    const folderRef = ref<HTMLElement[]>([])

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

    const handleFolderAccordion = (folderName: string, index: number) => {
      if (activeFolders.value.length === 0) {
        // 所有部门均处于折叠状态
        activeFolders.value = [folderName]
        nextTick(() => {
          animateFolder('open', index)
        })
      } else if (activeFolders.value[0] !== folderName) {
        // 其他部门处于折叠状态
        // const originTitle = activeFolders.value[0]
        animateFolder('close', index)
        activeFolders.value = [folderName]
        nextTick(() => {
          animateFolder('open', index)
        })
      } else {
        // 展开状态
        activeFolders.value = []
        animateFolder('close', index)
      }
    }

    const handleFolder = (folderName: string, type: 'layer' | 'folder', index: number) => {
      if (type !== 'folder') return
      if (accordion.value) {
        handleFolderAccordion(folderName, index)
        return
      }
      const idx = activeFolders.value.indexOf(folderName)
      if (idx !== -1) {
        // 展开状态
        activeFolders.value.splice(idx, 1)
        animateFolder('close', index)
      } else {
        // 折叠状态
        activeFolders.value.push(folderName)
        nextTick(() => {
          animateFolder('open', index)
        })
      }
    }

    return () => (
      <div class="ml-layers-group">
        {layers.value.map((layer, index) => {
          const { label } = layer
          return !layer.hasChildren ? (
            <Layer
              label={label}
              type="layer"
              level={level.value}
              parentLayerVisible={computeParentVisible(label)}
            />
          ) : (
            <>
              <Layer
                label={label}
                type="folder"
                isFold={activeFolders.value.includes(label)}
                parentLayerVisible={computeParentVisible(label)}
                onClick={(e) => handleFolder(e.label, e.type, index)}
              />
              <div
                ref={(el) => {
                  if (el) wrapperRef.value[index] = el as unknown as HTMLElement
                }}
                class={{
                  'sub-group': true,
                  'is-fold': !activeFolders.value.includes(label.toString())
                }}
              >
                <LayersGroup
                  ref={(el) => {
                    if (el && '$el' in el) {
                      folderRef.value[index] = el.$el as HTMLElement
                    }
                  }}
                  layers={layer.children || []}
                  totalLayers={totalLayers.value}
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
