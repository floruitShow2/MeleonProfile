import { defineComponent, onBeforeMount, ref } from 'vue'
import { FetchAllTasks } from '@/api/management/task'
import Draggable from 'vuedraggable'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Select, Option, Dropdown, Doption } from '@arco-design/web-vue'
import { IconPlusCircle } from '@arco-design/web-vue/es/icon'
import WsAvatar from '@/components/avatar'
import WsTaskCard from './components/taskCard'
import type { HiddenFields } from './components/taskCard/interface'
import 'swiper/css'
import './index.less'

export default defineComponent({
  setup() {
    // task manage
    const mapContentFields = ref<Record<HiddenFields, string>>({
      keywords: '关键词',
      tool: '按钮',
      title: '标题',
      description: '描述',
      relatives: '相关人',
      reports: '周报数量'
    })
    const contentSet = ref<HiddenFields[]>([])
    const onContentSetSelect = (value: string | number | Record<string, any> | undefined) => {
      const selected = (value || '').toString() as HiddenFields
      const findIdx = contentSet.value.findIndex((field) => field === selected)
      if (findIdx !== -1) {
        contentSet.value.splice(findIdx, 1)
      } else {
        contentSet.value.push(selected)
      }
    }
    // tasks list
    const draggableOptions = {
      animation: 200,
      group: 'task'
    }

    const columns = ref<
      Array<{
        title: string
        tasks: TaskMangeUtil.TaskCard[]
      }>
    >([])

    onBeforeMount(async () => {
      const { data } = await FetchAllTasks()
      if (!data) return
      columns.value = data
    })

    const displayMode = ref<Record<string, string>[]>([
      {
        type: 'table',
        label: '表格视图',
        icon: 'ws-template'
      },
      {
        type: 'card',
        label: '卡片视图',
        icon: 'ws-node'
      }
    ])
    const activeMode = ref<'card' | 'table'>('card')

    // user manage
    //   swiper
    const swiperRef = ref()
    const swiperList = ref<string[]>(['slide1', 'slide2', 'slide3'])
    const isNavigationShow = ref(false)
    const status = ref('online')
    const onSwiperPreClick = () => {
      swiperRef.value.$el.swiper.slidePrev()
    }
    const onSwiperNextClick = () => {
      swiperRef.value.$el.swiper.slideNext()
    }

    //   detail
    const details = ref<Record<string, string>[]>([
      {
        label: 'Role',
        value: 'Admin',
        type: 'text',
        icon: 'ws-user'
      },
      {
        label: 'Company',
        value: 'WEISI',
        type: 'text',
        icon: 'ws-home'
      },
      {
        label: 'Career',
        value: 'Front-End Programmer',
        type: 'text',
        icon: 'ws-career'
      },
      {
        label: 'Phone',
        value: '17856438069',
        type: 'text',
        icon: 'ws-call'
      },
      {
        label: 'Website',
        value: 'http://127.0.0.1:3000',
        type: 'text',
        icon: 'ws-link'
      },
      {
        label: 'Mail',
        value: '2320003602@qq.com',
        type: 'text',
        icon: 'ws-mail'
      },
      {
        label: 'Location',
        value: 'ShangHai Province',
        type: 'text',
        icon: 'ws-navigator'
      }
    ])

    return () => (
      <div class="ws-management-task">
        <div class="task-manage">
          <header class="task-manage-header">
            <div class="select-controller">
              <Select
                v-model:modelValue={activeMode.value}
                size="mini"
                v-slots={{
                  default: () =>
                    displayMode.value.map((mode) => (
                      <Option key={mode.type} value={mode.type} label={mode.label} />
                    )),
                  label: (scope: any) => (
                    <div class="arco-select-label">
                      <i
                        class={[
                          'iconfont',
                          `ws-${scope.data.value === 'table' ? 'template' : 'node'}`
                        ]}
                      ></i>
                      {scope.data.label}
                    </div>
                  )
                }}
              />
            </div>
            <Dropdown
              hide-on-select={false}
              v-slots={{
                default: () => (
                  <div class="controller">
                    <i class="iconfont ws-set" />
                    <span>内容配置</span>
                  </div>
                ),
                content: () =>
                  Object.keys(mapContentFields.value).map((field) => (
                    <Doption
                      value={field}
                      v-slots={{
                        default: () => mapContentFields.value[field as HiddenFields],
                        icon: () => (
                          <i
                            class={[
                              'iconfont',
                              contentSet.value.includes(field as HiddenFields)
                                ? 'ws-unview'
                                : 'ws-view'
                            ]}
                          />
                        )
                      }}
                    />
                  ))
              }}
              onSelect={onContentSetSelect}
            />
            <div class="controller">
              <i class="iconfont ws-filter" />
              <span>筛选</span>
            </div>
            <div class="controller">
              <i class="iconfont ws-sort" />
              <span>排序</span>
            </div>
            <div class="controller">
              <i class="iconfont ws-search" />
              <span>搜索</span>
            </div>
          </header>
          <section class="task-manage-content">
            {columns.value.map((column) => (
              <div key={column.title} class="column">
                <div class="column-header">
                  <p>{column.title}</p>
                </div>
                <Draggable
                  v-model={column.tasks}
                  // tag="transition-group"
                  itemKey={column.title}
                  componentData={{
                    class: 'column-content'
                  }}
                  // componentData={{
                  //   tag: 'ul',
                  //   name: 'flip-list'
                  // }}
                  ghost-class="ghost-card"
                  {...draggableOptions}
                  v-slots={{
                    header: () => (
                      <div class="column-plus">
                        <IconPlusCircle />
                      </div>
                    ),
                    item: ({ element }: any) => {
                      return (
                        <WsTaskCard key={element.id} data={element} hidden={contentSet.value} />
                      )
                    }
                  }}
                />
              </div>
            ))}
          </section>
        </div>
        <div class="user-manage">
          <div class="user-manage-title">
            <h4>EMPLOYEE DETAIL</h4>
            <i class="iconfont ws-more ibtn_base ibtn_hover"></i>
          </div>
          <div
            class="user-manage-swiper"
            onMouseenter={() => {
              isNavigationShow.value = true
            }}
            onMouseleave={() => {
              isNavigationShow.value = false
            }}
          >
            <i
              class={{
                'iconfont ws-arrow-left': true,
                'is-visiable': isNavigationShow.value
              }}
              onClick={onSwiperPreClick}
            />
            <Swiper ref={swiperRef} slides-per-view={1} space-between={50}>
              {swiperList.value.map((slide) => (
                <SwiperSlide>
                  <div class="avatar-item">
                    <WsAvatar size={72} shape="circle">
                      {slide}
                    </WsAvatar>
                    <span class={`is-${status.value}`} />
                  </div>
                  <span class="name-item">Mr.Beast</span>
                </SwiperSlide>
              ))}
            </Swiper>
            <i
              class={{
                'iconfont ws-arrow-right': true,
                'is-visiable': isNavigationShow.value
              }}
              onClick={onSwiperNextClick}
            />
          </div>
          <div class="user-manage-details">
            {details.value.map((message) => (
              <li key={message.label}>
                <i class={['iconfont', message.icon]}></i>
                <span>{message.label}</span>
                <span>{message.value}</span>
              </li>
            ))}
          </div>
          <div class="user-manage-chat">
            <div class="chat-marker">
              <span>CHAT</span>
            </div>
            <div class="chat-content"></div>
          </div>
        </div>
      </div>
    )
  }
})
