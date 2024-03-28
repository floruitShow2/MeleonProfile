import { defineComponent, ref, onMounted, nextTick, TransitionGroup } from 'vue'
import * as THREE from 'three'
import { Progress } from '@arco-design/web-vue'
import { IconCaretRight } from '@arco-design/web-vue/es/icon'
import VrRoom, { EventsMap, type PointEntity, type LoadingProgressEntity } from './core'
import { ROOM_0, POINTS_RESOURCE, ROOM_1, SUB_POINTS_RESOURCE } from './constants'
import TinyMap from './components/tinyMap'
import './index.less'

export default defineComponent({
  setup() {
    const vrRoom = ref<VrRoom>()

    const containerRef = ref()

    const showDetails = ref<boolean>(false)
    const curPoint = ref<PointEntity | null>(null)

    const inVisibleJumperPoints = ref<PointEntity[]>([])

    const showProgress = ref<boolean>(false)
    const progressDetails = ref<LoadingProgressEntity>({
      url: '',
      itemsLoaded: 0,
      itemsTotal: 0,
      progress: 0,
      loadingState: '',
      status: 'normal'
    })

    // tiny map
    const curPosition = ref<THREE.Vector2>(new THREE.Vector2(0, 0))
    const curRotation = ref<number>(0)

    onMounted(() => {
      nextTick(() => {
        vrRoom.value = new VrRoom({
          container: containerRef.value,
          currentScene: '0',
          debugger: false,
          cameraLookAt: new THREE.Vector3(0.5, 0, 0),
          cameraPosition: new THREE.Vector3(0, 0, 0)
        })

        // 监听加载进度变化
        vrRoom.value.on(EventsMap.oLS, (data: LoadingProgressEntity) => {
          showProgress.value = true
          progressDetails.value = { ...progressDetails.value, ...data }
        })
        vrRoom.value.on(EventsMap.oLP, (data: LoadingProgressEntity) => {
          progressDetails.value = { ...progressDetails.value, ...data }
        })
        vrRoom.value.on(EventsMap.oLE, (data: LoadingProgressEntity) => {
          progressDetails.value = { ...progressDetails.value, ...data }
          setTimeout(() => {
            showProgress.value = false
          }, 1000)
        })

        // 监听信息点点击事件
        vrRoom.value.on(EventsMap.oDC, (data: PointEntity) => {
          showDetails.value = true
          curPoint.value = data
        })

        vrRoom.value.on(EventsMap.oPC, (data: PointEntity) => {
          if (curPoint.value && curPoint.value?.title !== data.title) {
            showDetails.value = false
          }

          if (vrRoom.value && data.targetId) {
            curPosition.value = vrRoom.value.spheres[data.targetId].position
          }
        })

        // 监听可视跳转点变化
        vrRoom.value.on(EventsMap.oVP, (points: PointEntity[]) => {
          inVisibleJumperPoints.value = points
        })
        vrRoom.value.on(EventsMap.oPeC, (rotation: number) => {
          curRotation.value = rotation
        })

        // 初始化球体
        vrRoom.value.loadSphere(ROOM_0)
        curPosition.value = ROOM_0.position
        // 导入信息点
        vrRoom.value.loadPoints({ id: '0', points: POINTS_RESOURCE })
        // 初始化球体
        vrRoom.value.loadSphere(ROOM_1)
        // 导入信息点
        vrRoom.value.loadPoints({ id: '1', points: SUB_POINTS_RESOURCE })
      })
    })

    // 详情卡片
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
      },
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

    const handleFloatPointClick = (point: PointEntity) => {
      if (!vrRoom.value) return

      vrRoom.value.handleJumperEvent(point)
    }

    return () => (
      <div class="wrapper">
        <div ref={containerRef} id="container" class="vr">
          {/*  */}
          {showProgress.value && (
            <div class="progress-wrapper">
              <div class="progress-wrapper-container">
                <div class="progress-header">
                  <h4>资源{progressDetails.value.loadingState}</h4>
                  <div class="progress-header-details">
                    <span class="loading-data">{progressDetails.value.itemsLoaded}</span>
                    <span class="split-line">/</span>
                    <span class="loading-data">{progressDetails.value.itemsTotal}</span>
                  </div>
                </div>
                <Progress
                  percent={progressDetails.value.progress}
                  size="large"
                  status={progressDetails.value.status}
                />
              </div>
            </div>
          )}
          {/* the panel will be visible when a detail point is clicked on */}
          {showDetails.value && curPoint.value && (
            <div ref={cardRef} class="card-wrapper">
              <div class="card-wrapper-header">
                <i class="iconfont ws-arrow-right" onClick={closeDetailCard}></i>
                <span>{curPoint.value.title}</span>
              </div>
              <div class="card-wrapper-content">{details.value.map(genDetailCard)}</div>
            </div>
          )}
          {/* The floating labels in the 3D scene correspond to those points that are currently invisible. */}
          {!showDetails.value && (
            <div class="invisible-points">
              <TransitionGroup tag="ul" name="list">
                {inVisibleJumperPoints.value.map((poi) => (
                  <li
                    class="point-marker"
                    key={poi.title}
                    onClick={() => handleFloatPointClick(poi)}
                  >
                    <span>{poi.title}</span>
                    <IconCaretRight />
                  </li>
                ))}
              </TransitionGroup>
            </div>
          )}
          {!showDetails.value && (
            <div class="map-wrapper">
              <TinyMap
                url={new URL('@/assets/images/floor-plan.png', import.meta.url).href}
                position={curPosition.value}
                rotation={curRotation.value}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
})
