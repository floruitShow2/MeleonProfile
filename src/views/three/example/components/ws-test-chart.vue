<template>
  <div class="dynamic-bar-container" ref="echarts_instance" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Ref } from 'vue-property-decorator'
import * as echarts from 'echarts'
type EchartsOptions = echarts.EChartsOption
@Component
class TestBarChart extends Vue {
  @Ref() echarts_instance!: HTMLElement
  @Prop() size!: { width: number; height: number }
  chart: echarts.ECharts | null = null
  mounted() {
    this.initEcharts()
  }
  // @Watch('size', { deep: true, immediate: true })
  // size_handler(newVal: { width: number; height: number }) {
  //   if (this.chart) this.chart.resize(newVal)
  // }
  initEcharts() {
    const colors = ['#5470C6', '#91CC75', '#EE6666']
    const echartsOption: EchartsOptions = {
      color: colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true }
        }
      },
      grid: {
        top: '25%',
        left: '15%',
        right: '15%',
        bottom: '15%'
      },
      legend: {
        data: ['Evaporation', 'Precipitation']
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Evaporation',
          position: 'left',
          alignTicks: true,
          axisLabel: {
            formatter: '{value} ml'
          }
        },
        {
          type: 'value',
          name: 'Precipitation',
          position: 'right',
          alignTicks: true,
          axisLabel: {
            formatter: '{value} ml'
          }
        }
      ],
      series: [
        {
          name: 'Evaporation',
          type: 'bar',
          data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
        },
        {
          name: 'Precipitation',
          type: 'bar',
          yAxisIndex: 1,
          data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
        }
      ]
    }
    this.chart = echarts.init(this.echarts_instance)
    this.chart.setOption(echartsOption)
    this.chart.resize()
    window.addEventListener('resize', () => {
      if (this.chart) this.chart.resize()
    })
  }
}
export default TestBarChart
</script>

<style lang="less" scoped>
.dynamic-bar-container {
  width: 100%;
  height: 100%;
}
</style>
