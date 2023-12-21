import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/store'

import { FetchRecentFiles, FetchStreamFile } from '@/api/file'
import { formatToDateTime } from '@/utils/format'

import { Button, Table, TableColumn, Drawer } from '@arco-design/web-vue'
import WsAvatar from '@/components/avatar'
import WsAvatarGroup from '@/components/avatarGroup'
import WsFileCard from '@/components/fileCard'
import WsFolderCard from '../components/folderCard'
import WsFolderDetails from '../components/folderDetails'
import 'swiper/css'
import './index.less'

export default defineComponent({
  setup() {
    const bannerImage = new URL('@/assets/images/file-banner.png', import.meta.url).href
    const folderCover = new URL('@/assets/images/contact_bg.jpg', import.meta.url).href

    const appStore = useAppStore()
    const hiddenMenu = computed(() => appStore.hideMenu)

    // 仓库列表
    const wareshouses = ref<ApiFile.WarehouseType[]>([
      {
        id: '1',
        disabled: false
      },
      {
        id: '2',
        disabled: false
      },
      {
        id: '3',
        disabled: true
      },
      {
        id: '4',
        disabled: false,
        image: folderCover
      },
      {
        id: '5',
        disabled: false
      },
      {
        id: '6',
        disabled: true
      },
      {
        id: '7',
        disabled: false,
        image: folderCover
      }
    ])
    const warehouseNum = ref(5)
    const listWrapperRef = ref<HTMLElement>()
    const warehousesRefs = ref<HTMLElement[]>([])

    const activeWarehouse = ref<string>('1')
    const isActiveWarehouseDetailShow = ref(false)

    // 最近更新文件
    const recent = ref<number>(5)
    const recentFilesData = ref<ApiFile.RecentFileType[]>([])

    onMounted(async () => {
      // 初始化基础设置
      const { data } = await FetchRecentFiles(recent.value)
      if (!data) return
      recentFilesData.value = data
      // 初始化视口变化
      window.addEventListener('resize', () => {
        const warehouse = warehousesRefs.value[0]
        if (!warehouse || !listWrapperRef.value) {
          warehouseNum.value = 5
          return
        }
        const { width } = warehouse.getBoundingClientRect()
        const { width: wrapperWidth } = listWrapperRef.value.getBoundingClientRect()
        warehouseNum.value = Math.floor(wrapperWidth / width)
      })
    })
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        console.log('remove resize listener')
      })
    })

    const getStreamFile = async () => {
      const res = await FetchStreamFile()
      // if (!res.data) return
      // try {
      //   const url = window.URL.createObjectURL(new Blob([res.data]))
      //   const a = document.createElement('a')
      //   a.download = `${formatToDateTime(new Date())}.png`
      //   a.href = url
      //   document.body.appendChild(a)
      //   a.click()
      //   a.remove()
      // } catch (err) {
      //   console.log(err)
      // }
    }

    return () => (
      <div class="ws-file-management">
        <section class="file">
          <div class="file-banner">
            <div class="file-banner-message">
              <h1>Welcome To File Management!</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. ipsum consequuntur
                obcaecati praesentium distinctio incidunt!
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam commodi vitae
                debitis quos ipsam. Rem magnam, dignissimos dicta voluptate accusamus neque porro
                tempora deserunt architecto temporibus fugiat veniam quisquam nesciunt!
              </p>
              <Button type="primary" size="large" onClick={getStreamFile}>
                View More
              </Button>
            </div>
            <div class="file-banner-image">
              <img src={bannerImage} />
            </div>
          </div>
          <div class="file-warehouses">
            <div class="file-warehouses-title">
              <h4>Warehouses</h4>
              <div class="view-all-button">
                <span>view all</span>
                <i class="iconfont ws-arrow-right"></i>
              </div>
            </div>
            <div ref={listWrapperRef} class="file-warehouses-list">
              {wareshouses.value.slice(0, warehouseNum.value).map((warehouse, index) => (
                <WsFolderCard
                  ref={(el) => {
                    if (el) warehousesRefs.value[index] = '$el' in el ? el.$el : el
                  }}
                  activeId={warehouse.id}
                  active={activeWarehouse.value === warehouse.id}
                  disabled={warehouse.disabled}
                  image={warehouse.image}
                />
              ))}
            </div>
          </div>
          <div class="file-recent">
            <div class="file-recent-title">
              <h4>Recent Files</h4>
              <div class="view-all-button">
                <span>view all</span>
                <i class="iconfont ws-arrow-right"></i>
              </div>
            </div>
            <div class="file-recent-list">
              <Table
                data={recentFilesData.value}
                size="small"
                bordered={{
                  wrapper: true,
                  cell: true
                }}
                style="width: 100%"
                v-slots={{
                  columns: () => {
                    return (
                      <>
                        <TableColumn
                          title="File"
                          dataIndex="filename"
                          v-slots={{
                            cell: (scope: { record: ApiFile.RecentFileType }) => {
                              const { file } = scope.record
                              return (
                                <WsFileCard
                                  filename={file.filename}
                                  filesize={file.filesize}
                                  size="mini"
                                />
                              )
                            }
                          }}
                        ></TableColumn>
                        <TableColumn title="Uploader" dataIndex="uploader"></TableColumn>
                        <TableColumn
                          title="UploadTime"
                          dataIndex="uploadTime"
                          v-slots={{
                            cell: (scope: { record: ApiFile.RecentFileType }) => {
                              const { uploadTime } = scope.record
                              return formatToDateTime(uploadTime)
                            }
                          }}
                        ></TableColumn>
                        <TableColumn title="Views" dataIndex="views"></TableColumn>
                        <TableColumn title="Download" dataIndex="download"></TableColumn>
                        <TableColumn
                          title="Relatives"
                          dataIndex="relatives"
                          v-slots={{
                            cell: (scope: { record: ApiFile.RecentFileType }) => {
                              const { relatives } = scope.record
                              return (
                                <WsAvatarGroup maxCount={3}>
                                  {relatives.map((user) => (
                                    <WsAvatar size={28}>{user}</WsAvatar>
                                  ))}
                                </WsAvatarGroup>
                              )
                            }
                          }}
                        ></TableColumn>
                      </>
                    )
                  }
                }}
              ></Table>
            </div>
          </div>
        </section>
        {hiddenMenu.value ? (
          <Drawer
            visible={isActiveWarehouseDetailShow.value}
            width={430}
            placement="left"
            header={false}
            footer={false}
            maskClosable
            onCancel={() => {
              isActiveWarehouseDetailShow.value = false
            }}
          >
            <WsFolderDetails activeId={activeWarehouse.value} />
          </Drawer>
        ) : (
          <aside class="detail">
            {/* 仓库详情 */}
            <WsFolderDetails activeId={activeWarehouse.value} />
          </aside>
        )}
      </div>
    )
  }
})
