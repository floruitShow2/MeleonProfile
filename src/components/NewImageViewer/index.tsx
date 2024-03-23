import { defineComponent, PropType, ref, toRefs, Teleport, onBeforeUnmount } from 'vue'
import {
  IconCloseCircle,
  IconPlusCircle,
  IconMinusCircle,
  IconSync,
  IconRefresh
} from '@arco-design/web-vue/es/icon'
import './index.less'

export default defineComponent({
  props: {
    images: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['update:visible'],
  setup(props, { emit, expose }) {
    const { images } = toRefs(props)
    const visible = ref(false)

    const curIdx = ref<number>(0)

    const openImageViewer = () => {
      visible.value = true
    }
    const onClose = () => {
      visible.value = false
    }

    const wrapperRef = ref()
    const zoomScale = ref(1)
    const rotationDegree = ref(0)
    const onZoonOut = () => {
      if (!wrapperRef.value) return
      if (zoomScale.value < 1.5) zoomScale.value += 0.1
      const ele = wrapperRef.value as HTMLElement
      ele.style.transform = `rotate(${rotationDegree.value}deg) scale(${zoomScale.value})`
    }
    const onZoomIn = () => {
      if (!wrapperRef.value) return
      if (zoomScale.value > 0.5) zoomScale.value -= 0.1
      const ele = wrapperRef.value as HTMLElement
      ele.style.transform = `rotate(${rotationDegree.value}deg) scale(${zoomScale.value})`
    }

    window.addEventListener('wheel', (e) => {
      const delta = e.deltaY
      if (delta < 0) {
        onZoonOut()
      } else {
        onZoomIn()
      }
    })

    const onRotate = () => {
      if (!wrapperRef.value) return
      if (images.value && images.value.length > 1) return
      const ele = wrapperRef.value as HTMLElement
      rotationDegree.value += 90
      ele.style.transform = `rotate(${rotationDegree.value}deg) scale(${zoomScale.value})`
    }
    const onReset = () => {
      if (!wrapperRef.value) return
      zoomScale.value = 1
      rotationDegree.value = 0
      const ele = wrapperRef.value as HTMLElement
      ele.style.transform = `rotate(${rotationDegree.value}deg) scale(${zoomScale.value})`
    }

    onBeforeUnmount(() => {
      window.removeEventListener('wheel', onClose)
    })

    expose({
      visible,
      show: openImageViewer,
      close: onClose
    })

    return () => (
      <Teleport to="body">
        {visible.value && (
          <div class="viewer-modal">
            <div class="viewer-modal-mask" />
            <div class="viewer-modal-wrapper" ref={wrapperRef}>
              {images.value.length && <img class="view-image" src={images.value[curIdx.value]} />}
            </div>
            <div class="viewer-modal-close">
              <IconCloseCircle onClick={onClose} />
            </div>
            <div class="viewer-modal-tools">
              <div class="tool" onClick={onZoonOut}>
                <IconPlusCircle />
              </div>
              <div class="tool" onClick={onZoomIn}>
                <IconMinusCircle />
              </div>
              <div class="tool" onClick={onRotate}>
                <IconSync />
              </div>
              <div class="tool">
                <IconRefresh onClick={onReset} />
              </div>
            </div>
          </div>
        )}
      </Teleport>
    )
  }
})
