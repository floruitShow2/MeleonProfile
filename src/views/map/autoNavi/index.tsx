import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import './index.less'

export default defineComponent({
  setup() {
    const map = ref<AMap.Map>()

    const initMap = () => {
      map.value = new AMap.Map('container', {
        zoom: 11, // 级别
        center: [116.397428, 39.90923], // 中心点坐标
        viewMode: '2D' // 使用3D视图
      })
    }

    const addCircle = () => {
      if (!map.value) return
      // 构造矢量圆形
      const circle = new AMap.Circle({
        // 圆心位置
        center: new AMap.LngLat(116.403322, 39.920255),
        // 半径
        radius: 1000,
        // 线颜色
        strokeColor: '#F33',
        // 线透明度
        strokeOpacity: 1,
        // 线粗细度
        strokeWeight: 3,
        // 填充颜色
        fillColor: '#ee2200',
        // 填充透明度
        fillOpacity: 0.35
      })
      map.value.add([circle])
      map.value.setFitView([circle])
    }

    onMounted(() => {
      initMap()
      const infoWindow = new AMap.InfoWindow({
        isCustom: true,
        content: `
          <div>
            <div>aaa</div>
          </div>
        `,
        offset: new AMap.Pixel(16, -45)
      })

      const marker = new AMap.Marker({
        position: [116.39, 39.9]
      })
      marker.on('click', (e) => {
        if (map.value) infoWindow.open(map.value, e.target.getPosition())
      })
      if (map.value) {
        map.value.add(marker)
        map.value.plugin(['AMap.MouseTool'], () => {
          if (!map.value) return
          const mouseTool = new AMap.MouseTool(map.value)

          // 使用鼠标工具，在地图上画标记点
          mouseTool.polyline({})

          AMap.Event.addListener(mouseTool, 'draw', (e) => {
            console.log('a', e.obj, e.obj.getPath())
          })
        })
      }

      setTimeout(() => {
        addCircle()
      }, 3000)
    })

    onBeforeUnmount(() => {
      map.value?.clearMap()
    })

    return () => (
      <div class="map-wrapper">
        <div class="map-wrapper-view" id="container"></div>
        <div class="map-wrapper-tools">aaa</div>
      </div>
    )
  }
})
