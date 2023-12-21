import { defineComponent, ref, Teleport } from 'vue'
import { useEcharts } from '@/hooks/echarts'
import type { ECOption } from '@/hooks/echarts'
import { Collapse, CollapseItem, Input } from '@arco-design/web-vue'
import './index.less'

export default defineComponent({
  setup() {
    const chartOptions = ref<ECOption>({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      title: {
        text: '初始模板'
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
    const { domRef: lineRef } = useEcharts(chartOptions)
    return () => (
      <Teleport to="body">
        <div class="ws-chart-editor">
          <div class="ws-chart-editor-content">
            <div class="preview-zone">
              <div ref={lineRef} class="preview-zone-chart"></div>
            </div>
            <div class="setting-zone">
              <Collapse bordered={false}>
                <CollapseItem header="标题">
                  <div class="config-item">
                    <div class="config-item-title">主标题</div>
                    <div class="config-item-editor">
                      {chartOptions.value.title && !Array.isArray(chartOptions.value.title) && (
                        <Input v-model:modelValue={chartOptions.value.title.text} />
                      )}
                    </div>
                  </div>
                </CollapseItem>
              </Collapse>
            </div>
          </div>
          <div class="ws-chart-editor-mask" />
        </div>
      </Teleport>
    )
  }
})
