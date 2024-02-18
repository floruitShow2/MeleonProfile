import {
  defineComponent,
  reactive,
  defineAsyncComponent,
  h,
  resolveComponent,
  Transition,
  watch,
  KeepAlive,
  ref,
  onMounted
} from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Menu, SubMenu, MenuItem } from '@arco-design/web-vue'
import {
  IconCommon,
  IconFile,
  IconShareExternal,
  IconUserGroup
} from '@arco-design/web-vue/es/icon'
import type { MenuListType } from './interface'
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
    const route = useRoute()

    const menuState = reactive({
      collapsed: false,
      selectedKeys: ['overviewMenu'],
      openKeys: []
    })

    const menuList = ref<MenuListType[]>([
      {
        code: 'overviewMenu',
        icon: <IconCommon />,
        label: '首页'
      },
      {
        code: 'content',
        icon: <IconFile />,
        label: '内容管理',
        children: [
          {
            code: 'articleMenu',
            label: '文章管理'
          }
        ]
      },
      {
        code: 'team',
        label: '团队管理',
        icon: <IconUserGroup />,
        children: [
          {
            code: 'teamMenu',
            label: '我的团队'
          },
          {
            code: 'memberMenu',
            label: '成员管理'
          }
        ]
      },
      {
        code: 'tool',
        label: '创作工具',
        icon: <IconShareExternal />,
        children: [
          {
            code: 'importMenu',
            label: '文章导入发布'
          }
        ]
      }
    ])

    onMounted(() => {
      const { code } = route.query
      if (!code) return
      menuState.selectedKeys = [code as string]
    })

    watch(
      menuState,
      (newVal) => {
        console.log(menuState.selectedKeys[0])
      },
      { deep: true }
    )

    const handleMenuSkip = (key: string) => {
      menuState.selectedKeys = [key]
    }

    const onWriteArticle = () => {
      router.push({
        name: 'articles/editor'
      })
    }

    const genMenu = (menus: MenuListType[]) => {
      return menus.map((menu) => {
        if (menu.children) {
          return (
            <SubMenu
              key={menu.code}
              v-slots={{
                icon: () => menu.icon,
                title: () => <>{menu.label}</>
              }}
            >
              {genMenu(menu.children)}
            </SubMenu>
          )
        }
        return (
          <MenuItem
            key={menu.code}
            v-slots={{
              icon: () => menu.icon
            }}
          >
            {menu.label}
          </MenuItem>
        )
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
                {/* <MenuItem
                  key="overviewMenu"
                  v-slots={{
                    icon: () => <icon-common />
                  }}
                >
                  <span>首页</span>
                </MenuItem>
                <SubMenu
                  key="content"
                  v-slots={{
                    icon: () => <icon-file />,
                    title: () => <>内容管理</>
                  }}
                >
                  <MenuItem key="articleMenu">文章管理</MenuItem>
                </SubMenu>
                <SubMenu
                  key="tool"
                  v-slots={{
                    icon: () => <icon-share-external />,
                    title: () => <>创作工具</>
                  }}
                >
                  <MenuItem key="importMenu">文章导入发布</MenuItem>
                </SubMenu> */}
                {genMenu(menuList.value)}
              </Menu>
            </div>
            <div class="creator-center-main_main">
              <Transition mode="out-in" name="fade-slide" appear>
                <KeepAlive>
                  {h(resolveComponent(menuState.selectedKeys[0]), {
                    key: menuState.selectedKeys[0],
                    onSkip: handleMenuSkip
                  })}
                </KeepAlive>
              </Transition>
            </div>
          </section>
        </div>
      </>
    )
  }
})
