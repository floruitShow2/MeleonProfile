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

    const addDrivingPath = () => {
      // 构造路线导航类
      AMap.plugin(['AMap.Driving'], () => {
        const driving = new AMap.Driving({
          map: map.value
        })
        driving.search(
          new AMap.LngLat(116.379028, 39.865042),
          new AMap.LngLat(116.427281, 39.903719),
          function (status, result) {
            if (status === 'complete') {
              console.log('绘制驾车路线完成', result)
            } else {
              console.error(`获取驾车数据失败：${result}`)
            }
          }
        )
      })
    }

    onMounted(() => {
      initMap()
      const infoWindow = new AMap.InfoWindow({
        content: [
          '<div>',
          '<div style="padding:0px 4px;"><b>高德软件有限公司</b>',
          '电话 : 010-84107000   邮编 : 100102',
          '地址 : 北京市望京阜通东大街方恒国际中心A座16层</div></div>'
        ].join('<br>'),
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
        AMap.plugin(['AMap.MouseTool'], () => {
          if (!map.value) return
          const mouseTool = new AMap.MouseTool(map.value)
          // 使用鼠标工具，在地图上画标记点
          // 参数用来配置 绘制线条 的样式
          mouseTool.polyline({})
          // mouseTool.rule({})

          mouseTool.on('draw', (e) => {
            console.log('a', e)
          })
        })
      }

      setTimeout(() => {
        addCircle()
        addDrivingPath()
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
