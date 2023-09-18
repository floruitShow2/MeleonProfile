import { PropType, computed, defineComponent, inject, nextTick, onMounted, ref, toRefs } from 'vue'
import { useIndex } from '@/utils/slots'
import { cs } from '@/utils/property'
import { avatarGroupInjectionKey } from './context'
import './index.less'

export default defineComponent({
  props: {
    imgUrl: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 32
    },
    shape: {
      type: String as PropType<'circle' | 'square'>,
      default: 'square'
    }
  },
  setup(props, { slots }) {
    const prefixCls = 'ws-avatar'

    const { size, shape, imgUrl } = toRefs(props)

    const itemRef = ref()
    const wrapperRef = ref()
    const groupCtx = inject(avatarGroupInjectionKey)
    const index = groupCtx ? useIndex({ itemRef, selector: '.ws-avatar' }).computedIndex : ref(-1)

    const outerStyle = computed(() => {
      const style: Record<string, any> = {
        width: `${size.value}px`,
        height: `${size.value}px`
      }

      if (groupCtx) {
        style.zIndex = groupCtx.total - index.value
      }

      return style
    })

    const autoFixFontSizeHanlder = () => {
      if (!imgUrl.value) {
        nextTick(() => {
          if (!wrapperRef.value || !itemRef.value) return
          const textWidth = wrapperRef.value.clientWidth
          const avatarWidth = itemRef.value.clientWidth
          const scale = avatarWidth / (textWidth + 8)
          if (avatarWidth && scale < 1) {
            wrapperRef.value.style.transform = `scale(${scale})`
          }
        })
      }
    }

    const className = computed(() => cs(prefixCls, `${prefixCls}-${shape.value}`))

    onMounted(() => {
      autoFixFontSizeHanlder()
    })

    return () => {
      return (
        <>
          <div class={className.value} ref={itemRef} style={outerStyle.value}>
            {imgUrl.value ? (
              <img class="ws-avatar-iamge" src={imgUrl.value} alt="" />
            ) : (
              <div ref={wrapperRef} class="ws-avatar-text">
                {slots.default && slots.default()}
              </div>
            )}
          </div>
        </>
      )
    }
  }
})
