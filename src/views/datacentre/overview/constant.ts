import type { ECOption } from '@/hooks/echarts'

export const LineOption: ECOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  //   legend: {
  //     data: ['下载量', '注册数']
  //   },
  grid: {
    left: '1%',
    right: '1%',
    bottom: '3%',
    top: '4%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E7E7E7'
        }
      },
      data: [
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        '24:00'
      ]
    }
  ],
  yAxis: [
    {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E7E7E7'
        }
      }
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
      data: new Array(24).fill(0).map(() => Math.floor(Math.random() * 1000))
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
      data: new Array(24).fill(0).map(() => Math.floor(Math.random() * 1000))
    }
  ]
}

export const PieOption: ECOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    type: 'scroll',
    orient: 'vertical',
    left: 0,
    top: 20,
    bottom: 20
  },
  series: [
    {
      name: 'Radius Mode',
      type: 'pie',
      color: ['#8e9dff', '#26deca'],
      radius: [60, 100],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true
        }
      },
      data: [
        { value: 60, name: 'rose 1' },
        { value: 33, name: 'rose 2' }
      ]
    }
  ]
}

export const BarOption: ECOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  legend: {
    data: ['Evaporation', 'Precipitation', 'Temperature']
  },
  grid: {
    left: '1%',
    right: '1%',
    bottom: '3%',
    top: '50px',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisPointer: {
        type: 'shadow'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E7E7E7'
        }
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Precipitation',
      min: 0,
      max: 250,
      interval: 50,
      axisLabel: {
        formatter: '{value} ml'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E7E7E7'
        }
      }
    },
    {
      type: 'value',
      name: 'Temperature',
      min: 0,
      max: 25,
      interval: 5,
      axisLabel: {
        formatter: '{value} °C'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E7E7E7'
        }
      }
    }
  ],
  series: [
    {
      name: 'Evaporation',
      type: 'bar',
      color: ['#26deca'],
      tooltip: {
        valueFormatter(value) {
          return `${value as number} ml`
        }
      },
      data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
    },
    {
      name: 'Precipitation',
      type: 'bar',
      color: ['#8e9dff'],
      tooltip: {
        valueFormatter(value) {
          return `${value as number} ml`
        }
      },
      data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
    },
    {
      name: 'Temperature',
      type: 'line',
      yAxisIndex: 1,
      tooltip: {
        valueFormatter(value) {
          return `${value as number} °C`
        }
      },
      data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
    }
  ]
}
