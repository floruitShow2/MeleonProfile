import { defineComponent, ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import VrRoom, { EventsMap, type PointEntity } from './core'
import './index.less'
import { POINTS_RESOURCE } from './constants'

export default defineComponent({
  setup() {
    const containerRef = ref()

    const showDetails = ref<boolean>(false)
    const curPoint = ref<PointEntity | null>(null)
    onMounted(() => {
      nextTick(() => {
        const vrRoom = new VrRoom({
          container: containerRef.value,
          debugger: false,
          cameraLookAt: new THREE.Vector3(0.5, 0, 0),
          cameraPosition: new THREE.Vector3(0, 0, 0.01)
        })
        // 初始化球体
        vrRoom.loadSphere({ url: '/textures/room2.jpg' })
        // 导入信息点
        vrRoom.loadPoints({ points: POINTS_RESOURCE })

        vrRoom.on(EventsMap.oDC, (data: PointEntity) => {
          showDetails.value = true
          curPoint.value = data
        })

        vrRoom.on(EventsMap.oPC, (data: PointEntity) => {
          if (curPoint.value && curPoint.value?.title !== data.title) {
            showDetails.value = false
          }
        })
      })
    })

    const cardRef = ref<HTMLElement>()
    const closeDetailCard = () => {
      if (!cardRef.value) return
      cardRef.value.animate(
        [
          { transform: 'translateX(0) translateY(-50%)', opacity: 1 },
          { transform: 'translateX(100%) translateY(-50%)', opacity: 0 }
        ],
        { duration: 500, easing: 'ease' }
      ).onfinish = () => {
        showDetails.value = false
      }
    }

    interface CardItem {
      title: string
      icon: string
      enTitle: string
      content: string
    }
    const details = ref<CardItem[]>([
      {
        title: '线上签字',
        icon: 'ws-edit',
        enTitle: 'Electronic Signature',
        content: '详细信息1'
      },
      {
        title: '线上缴费',
        icon: 'ws-career',
        enTitle: 'Online Payment',
        content: '详细信息2'
      },
      {
        title: '视频过户',
        icon: 'ws-audio',
        enTitle: 'Video Transfer',
        content: '详细信息3'
      }
    ])
    const genDetailCard = (data: CardItem) => {
      return (
        <div class="detail-card">
          <header>
            <div class="icon-title">
              <i class={`iconfont ${data.icon}`}></i>
              <span>{data.enTitle}</span>
            </div>
            <span class="main-title">{data.title}</span>
          </header>
          <section>{data.content}</section>
        </div>
      )
    }

    return () => (
      <div class="wrapper">
        <div ref={containerRef} id="container" class="vr"></div>
        {showDetails.value && curPoint.value && (
          <div ref={cardRef} class="card">
            <div class="card-header">
              <i class="iconfont ws-arrow-right" onClick={closeDetailCard}></i>
              <span>{curPoint.value.title}</span>
            </div>
            <div class="card-content">{details.value.map(genDetailCard)}</div>
          </div>
        )}
      </div>
    )
  }
})
