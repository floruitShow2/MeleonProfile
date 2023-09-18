import { computed, defineComponent, ref, toRefs } from 'vue'
import type { PropType } from 'vue'
import './index.less'

export default defineComponent({
  props: {
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
    const { label, type, level, isFold, parentLayerVisible } = toRefs(props)

    const isVisible = ref(true)
    const isSelected = ref(false)

    const LayerOffsetLeft = computed(() => {
      if (type.value === 'layer') return level.value === 0 ? 10 : level.value * 30
      return 10
    })

    const onMouseEnter = () => {
      emit('mouseEnter', {
        label: label.value,
        type: type.value
      })
    }
    const onMouseLeave = () => {
      emit('mouseLeave', {
        label: label.value,
        type: type.value
      })
    }
    const onDetailsClick = (e: MouseEvent) => {
      e.stopPropagation()
      emit('detailClick', {
        label: label.value,
        type: type.value
      })
    }
    const onVisibleClick = (e: MouseEvent) => {
      e.stopPropagation()
      emit('visibleChange', {
        label: label.value,
        type: type.value
      })
    }
    const onLayerClick = () => {
      emit('click', { label: label.value, type: type.value })
    }

    return () => (
      <div
        class={['ml-layer-container', `is-${type.value}`, isSelected.value && 'is-selected']}
        style={{
          paddingLeft: `${LayerOffsetLeft.value}px`
        }}
        onMouseenter={onMouseEnter}
        onMouseleave={onMouseLeave}
        onClick={onLayerClick}
      >
        <div class={['main', isVisible.value && parentLayerVisible.value ? '' : 'is-not-visible']}>
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
