import { defineComponent, PropType, ref, toRefs, Teleport } from 'vue'
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
      type: Array as PropType<HTMLImageElement[]>,
      default: () => []
    }
  },
  setup(props, { slots }) {
    const { images } = toRefs(props)
    const firstEle = slots.default && slots.default()[0]
    const isImage = firstEle?.type === 'img'

    const isImageViewerShow = ref(false)
    const openImageViewer = () => {
      isImageViewerShow.value = true
    }
    const onClose = () => {
      isImageViewerShow.value = false
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

    return () => (
      <div class="ws-image-viewer">
        <div class="ws-image-viewer-wrapper">
          {isImage && (
            <div class="dropdown-layer">
              <i class="iconfont ws-view" onClick={openImageViewer}></i>
            </div>
          )}
          <div class="image">{firstEle}</div>
        </div>
        <Teleport to="body">
          {isImageViewerShow.value && (
            <div class="viewer-modal">
              <div class="viewer-modal-mask" />
              <div class="viewer-modal-wrapper" ref={wrapperRef}>
                {images.value.length ? images.value : firstEle}
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
      </div>
    )
  }
})
