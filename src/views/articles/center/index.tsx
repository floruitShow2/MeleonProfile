import {
  defineComponent,
  reactive,
  defineAsyncComponent,
  h,
  resolveComponent,
  KeepAlive
} from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Menu, SubMenu, MenuItem } from '@arco-design/web-vue'
import './index.less'

const ms: Record<string, () => Promise<Component>> = import.meta.glob('./components/**/**.tsx')
const modules: Record<string, Component> = {}
Object.keys(ms).forEach((key) => {
  const marker = key.split('/')[2]
  modules[marker] = defineAsyncComponent(ms[key])
})

export default defineComponent({
  components: {
    ...modules
  },
  setup() {
    const router = useRouter()

    const menuState = reactive({
      collapsed: false,
      selectedKeys: ['overview'],
      openKeys: []
    })

    const onWriteArticle = () => {
      router.push({
        name: 'articles/editor'
      })
    }
    return () => (
      <>
        <div class="creator-center">
          <section class="creator-center-main">
            <div class="creator-center-main_menu">
              <Button type="primary" size="large" onClick={onWriteArticle}>
                写文章
              </Button>
              <Menu
                v-model:openKeys={menuState.openKeys}
                v-model:selectedKeys={menuState.selectedKeys}
                mode="vertical"
              >
                <MenuItem
                  key="overview"
                  v-slots={{
                    icon: () => <icon-common />
                  }}
                >
                  <span>首页</span>
                </MenuItem>
                <SubMenu
                  key="tool"
                  v-slots={{
                    icon: () => <icon-share-external />,
                    title: () => <>创作工具</>
                  }}
                >
                  <MenuItem key="import">文章导入发布</MenuItem>
                </SubMenu>
              </Menu>
            </div>
            <div class="creator-center-main_main">
              {h(resolveComponent(menuState.selectedKeys[0]))}
            </div>
          </section>
        </div>
      </>
    )
  }
})
