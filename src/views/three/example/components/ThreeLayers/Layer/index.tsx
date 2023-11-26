import { computed, defineComponent, ref, toRefs } from 'vue'
import type { PropType } from 'vue'
import { useBus } from '@/utils/global'
import { cs } from '@/utils/property'
import './index.less'

export default defineComponent({
  props: {
    uuid: {
      type: [String, Number, Symbol],
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<'layer' | 'folder'>,
      default: 'layer'
    },
    level: {
      type: Number,
      default: 0
    },
    isFold: {
      type: Boolean,
      default: false
    },
    parentLayerVisible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['mouseEnter', 'mouseLeave', 'click', 'detailClick', 'visibleChange'],
  setup(props, { emit }) {
    const { uuid, label, type, level, isFold, parentLayerVisible } = toRefs(props)

    const $bus = useBus()

    const isVisible = ref(true)
    const isSelected = ref(false)

    const LayerOffsetLeft = computed(() => {
      return level.value === 0 ? 10 : level.value * 20
    })

    const className = computed(() =>
      cs('ml-layer-container', [`is-${type.value}`], {
        'is-selected': isSelected.value,
        'is-unvisible': !isVisible.value || !parentLayerVisible.value
      })
    )

    const emitParams = computed(() => {
      return {
        uuid: uuid.value,
        label: label.value,
        type: type.value,
        isVisible: isVisible.value
      }
    })

    const onMouseEnter = () => {
      $bus.emit('mouseEnter', emitParams.value)
    }
    const onMouseLeave = () => {
      $bus.emit('mouseLeave', emitParams.value)
    }
    const onDetailsClick = (e: MouseEvent) => {
      e.stopPropagation()
      $bus.emit('detailClick', emitParams.value)
    }
    const onVisibleClick = (e: MouseEvent) => {
      e.stopPropagation()
      isVisible.value = !isVisible.value
      emit('visibleChange')
      $bus.emit('visibleChange', emitParams.value)
    }
    const onLayerClick = () => {
      emit('click', emitParams.value)
      $bus.emit('click', emitParams.value)
    }

    return () => (
      <div
        class={className.value}
        style={{
          paddingLeft: `${LayerOffsetLeft.value}px`
        }}
        onMouseenter={onMouseEnter}
        onMouseleave={onMouseLeave}
        onClick={onLayerClick}
      >
        <div class="main" title={label.value}>
          {type.value === 'folder' ? (
            <i class={['iconfont ws-arrow-up', isFold.value ? 'is-folded' : '']} />
          ) : (
            <i class={['iconfont', `ws-${type.value}`]} />
          )}
          <span>{label.value}</span>
        </div>
        <div class="toolList">
          <i class="iconfont ws-template ibtn_base ibtn_mini ibtn_hover" onClick={onDetailsClick} />
          <i
            class={[
              'ibtn_base ibtn_mini ibtn_hover',
              'iconfont',
              isVisible.value ? 'ws-view' : 'ws-unview'
            ]}
            onClick={onVisibleClick}
          />
        </div>
      </div>
    )
  }
})
