import { defineComponent, ref } from 'vue'
import { useEcharts } from '@/hooks/echarts'
import type { ECOption } from '@/hooks/echarts'
import { Tooltip, Drawer, Button } from '@arco-design/web-vue'
import type { GridItemExtendOptions } from './interface'
import './index.less'

export default defineComponent({
  setup() {
    const VueGridLayouts = ref<GridItemExtendOptions[]>([
      {
        x: 0,
        y: 0,
        w: 4,
        h: 2,
        minW: 4,
        minH: 2,
        i: Math.random().toFixed(8),
        title: '示例组件'
      }
    ])

    const lineOptions = ref<ECOption>({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['下载量', '注册数']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: [
            '06:00',
            '08:00',
            '10:00',
            '12:00',
            '14:00',
            '16:00',
            '18:00',
            '20:00',
            '22:00',
            '24:00'
          ]
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          color: '#8e9dff',
          name: '下载量',
          type: 'line',
          smooth: true,
          stack: 'Total',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.25,
                  color: '#8e9dff'
                },
                {
                  offset: 1,
                  color: '#fff'
                }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: [4623, 6145, 6268, 6411, 1890, 4251, 2978, 3880, 3606, 4311]
        },
        {
          color: '#26deca',
          name: '注册数',
          type: 'line',
          smooth: true,
          stack: 'Total',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.25,
                  color: '#26deca'
                },
                {
                  offset: 1,
                  color: '#fff'
                }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: [2208, 2016, 2916, 4512, 8281, 2008, 1963, 2367, 2956, 678]
        }
      ]
    })
    const { domRef: lineRef } = useEcharts(lineOptions)

    const isSetDrawerShow = ref(false)
    const activeGridItem = ref<GridItemExtendOptions | null>(null)
    const handleSet = (gridItem: GridItemExtendOptions) => {
      isSetDrawerShow.value = true
      activeGridItem.value = gridItem
    }

    return () => (
      <div class="ws-data-centre">
        <div class="ws-data-centre-toolkits">
          <span>Toolkits</span>
          <Button
            type="primary"
            size="mini"
            v-slots={{
              icon: () => <i class="iconfont ws-plus-bold"></i>
            }}
          >
            创建新控件
          </Button>
        </div>
        <div class="ws-data-centre-grid">
          <grid-layout
            v-model:layout={VueGridLayouts.value}
            colNum={12}
            row-height={120}
            is-draggable={true}
            is-resizable={true}
            is-mirrored={false}
            vertical-compact={true}
            margin={[20, 20]}
            use-css-transforms={true}
          >
            {VueGridLayouts.value.map((grid) => (
              <grid-item
                key={grid.i}
                x={grid.x}
                y={grid.y}
                w={grid.w}
                minW={grid.minW}
                minH={grid.minH}
                h={grid.h}
                i={grid.i}
                drag-allow-from=".vue-draggable-handle"
                drag-ignore-from=".no-drag"
                v-slots={{
                  default: () => (
                    <>
                      <div class="vue-grid-item-header">
                        <span class="vue-draggable-handle">
                          <i class="iconfont ws-matrix"></i>
                          <span>{grid.title}</span>
                        </span>
                        <div class="tools">
                          <Tooltip
                            content="设置"
                            mini
                            v-slots={{
                              default: () => (
                                <i
                                  class="iconfont ws-set ibtn_mini ibtn_hover"
                                  onClick={() => handleSet(grid)}
                                ></i>
                              )
                            }}
                          />
                          <Tooltip
                            content="全屏"
                            mini
                            v-slots={{
                              default: () => <i class="iconfont ws-full ibtn_mini ibtn_hover"></i>
                            }}
                          />
                          <Tooltip
                            content="更多"
                            mini
                            v-slots={{
                              default: () => <i class="iconfont ws-more ibtn_mini ibtn_hover"></i>
                            }}
                          />
                        </div>
                      </div>
                      <div class="vue-grid-item-content">
                        <div ref={lineRef} class="line-chart"></div>
                      </div>
                    </>
                  )
                }}
              />
            ))}
          </grid-layout>
        </div>
        {/* 图表编辑器弹窗 */}
        {/* <WsChartEditor /> */}
        {/* 设置功能弹窗 */}
        <Drawer
          visible={isSetDrawerShow.value}
          placement="right"
          width={400}
          header={false}
          footer={false}
          maskClosable
          onCancel={() => {
            isSetDrawerShow.value = false
          }}
        >
          <span>{activeGridItem.value?.i}</span>
        </Drawer>
      </div>
    )
  }
})
