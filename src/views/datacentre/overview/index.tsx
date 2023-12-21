import { defineComponent, onMounted, ref, reactive } from 'vue'
import { useEcharts } from '@/hooks/echarts'
import type { ECOption } from '@/hooks/echarts'
import { FetchDataCards } from '@/api/chart'
import { formatToDate } from '@/utils/format'
import { Statistic, Select, Option, Table } from '@arco-design/web-vue'
import { IconArrowRise } from '@arco-design/web-vue/es/icon'
import WsAvatar from '@/components/avatar'
import { LineOption, PieOption, BarOption } from './constant'
import './index.less'

export default defineComponent({
  setup() {
    const dataCards = ref<ApiChart.OverviewCardType[]>([])

    onMounted(async () => {
      const { data } = await FetchDataCards()
      if (!data) return
      dataCards.value = data
    })

    const RenderDataCard = (cardProps: ApiChart.OverviewCardType) => {
      const { label, data, unit, rate } = cardProps
      return (
        <div class="data-card">
          <h4>{label.toLocaleUpperCase()}</h4>
          <div class="data-card-details">
            <Statistic
              value={data}
              animation
              v-slots={{
                suffix: () => <span> {unit}</span>
              }}
            />
            <div class="rate">
              <span class={[rate > 0 ? 'is-raise' : 'is-down']}>
                <i class={['iconfont', rate > 0 ? 'ws-rate-raise' : 'ws-rate-down']}></i>
                <span>{`${(rate * 100).toFixed(1)} %`}</span>
              </span>
              <span class="tooltip">较昨日</span>
            </div>
          </div>
        </div>
      )
    }

    const lineOptions = ref<ECOption>(LineOption)
    const pieOptions = ref<ECOption>(PieOption)
    const barOptions = ref<ECOption>(BarOption)
    const { domRef: Chart1Ref } = useEcharts(lineOptions)
    const { domRef: Chart2Ref } = useEcharts(pieOptions)
    const { domRef: Chart3Ref } = useEcharts(barOptions)

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Salary',
        dataIndex: 'salary'
      },
      {
        title: 'Address',
        dataIndex: 'address'
      },
      {
        title: 'Email',
        dataIndex: 'email'
      }
    ]
    const data = reactive([
      {
        key: '1',
        name: 'Jane Doe',
        salary: 23000,
        address: '32 Park Road, London',
        email: 'jane.doe@example.com'
      },
      {
        key: '2',
        name: 'Alisa Ross',
        salary: 25000,
        address: '35 Park Road, London',
        email: 'alisa.ross@example.com'
      },
      {
        key: '3',
        name: 'Kevin Sandra',
        salary: 22000,
        address: '31 Park Road, London',
        email: 'kevin.sandra@example.com'
      },
      {
        key: '4',
        name: 'Ed Hellen',
        salary: 17000,
        address: '42 Park Road, London',
        email: 'ed.hellen@example.com'
      },
      {
        key: '5',
        name: 'William Smith',
        salary: 27000,
        address: '62 Park Road, London',
        email: 'william.smith@example.com'
      }
    ])

    return () => (
      <div class="ws-overview">
        <div class="ws-overview-banner">
          <div class="banner-content">
            <div class="banner-content-message">
              <h4>Hello Meleon!</h4>
              <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>
            </div>
            <div class="banner-content-button">
              <i class="iconfont ws-bulb"></i>
              <span>Announcement</span>
            </div>
          </div>
          <div class="banner-cards">{dataCards.value.map((item) => RenderDataCard(item))}</div>
        </div>
        <div class="ws-overview-main">
          <div class="main-section">
            <div class="chart-1">
              <div class="header">
                <span>Chart 1</span>
                <div class="operate">
                  <Select size="mini">
                    <Option label="This Week" value="week"></Option>
                    <Option label="This Month" value="month"></Option>
                    <Option label="This Year" value="year"></Option>
                  </Select>
                </div>
              </div>
              <div ref={Chart1Ref} class="content"></div>
            </div>
            <div class="main-section-container">
              <div class="chart-2">
                <div class="header">
                  <span>chart 2</span>
                </div>
                <div ref={Chart2Ref} class="content"></div>
              </div>
              <div class="chart-3">
                <div class="header">
                  <span>chart 3</span>
                </div>
                <div ref={Chart3Ref} class="content"></div>
              </div>
            </div>
            <div class="main-section-table">
              <div class="header">
                <span>table</span>
              </div>
              <div class="content">
                <Table columns={columns} data={data}></Table>
              </div>
            </div>
          </div>
          <div class="main-aside">
            <div class="row-1">
              <div class="credit-card">
                <div class="glass-card">
                  <div class="glass-card-header">
                    <WsAvatar size={36}>User</WsAvatar>
                    <div class="message">
                      <h4>User</h4>
                      <span>Lorem ipsum adipisicing elit.</span>
                    </div>
                  </div>
                  <div class="glass-card-content">
                    <p>
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laudantium hic porro
                      sapiente molestiae maxime eum dolore eaque rem autem non, eligendi amet, Illo,
                      nulla?
                    </p>
                  </div>
                  <div class="glass-card-footer">
                    <div class="message">
                      <span>Account Level</span>
                      <span>Manager</span>
                    </div>
                    <div class="message">
                      <span>Register Date</span>
                      <span>{formatToDate(new Date())}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-items">
                <div class="item">
                  <i class="iconfont ws-bulb"></i>
                  <Statistic
                    title="User Growth Rate"
                    value={50.52}
                    precision={2}
                    value-from={0}
                    animation
                    v-slots={{
                      prefix: () => <IconArrowRise />,
                      suffix: () => '%'
                    }}
                  />
                </div>
                <div class="item">
                  <i class="iconfont ws-clock"></i>
                  <Statistic
                    title="User Growth Rate"
                    value={50.52}
                    precision={2}
                    value-from={0}
                    animation
                    v-slots={{
                      prefix: () => <IconArrowRise />,
                      suffix: () => '%'
                    }}
                  />
                </div>
              </div>
              {/* <div class="card-quota"></div> */}
              {/* <div class="card-button"></div> */}
            </div>
            <div class="row-2"></div>
            <div class="row-3"></div>
          </div>
        </div>
      </div>
    )
  }
})
