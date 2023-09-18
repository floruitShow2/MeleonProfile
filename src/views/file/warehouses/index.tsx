import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@arco-design/web-vue'
import { IconFolderAdd } from '@arco-design/web-vue/es/icon'
import WsFileCard from '@/components/fileCard'
import WsFolderCard from '../components/folderCard'
import WsFolderDetails from '../components/folderDetails'
import './index.less'

export default defineComponent({
  setup() {
    const route = useRoute()

    const { id } = route.query

    const breadcrumb = ref<string[]>(['全部文件'])

    const handleFolderOpen = (e: { id: string; name: string }) => {
      const { name } = e
      breadcrumb.value = [...new Set([...breadcrumb.value, name])]
    }

    const generateFolderList = (n = 9) => {
      const result: JSX.Element[] = []
      for (let i = 0; i < n; i++) {
        result.push(<WsFolderCard activeId={i.toFixed()} onOpen={handleFolderOpen} />)
      }
      return result
    }

    return () => (
      <div class="ws-warehouses">
        <div class="ws-warehouses-wrapper">
          {/* main */}
          <div class="warehouses-main">
            <div class="warehouses-main-header">
              <div class="title">
                <h4>Warehouses</h4>
                <div class="breadcrumb">
                  {breadcrumb.value.map((bread, index) => (
                    <>
                      <span>{bread}</span>
                      {index !== breadcrumb.value.length - 1 && <span> / </span>}
                    </>
                  ))}
                </div>
              </div>
              <div class="tool">
                <Button
                  type="primary"
                  size="small"
                  v-slots={{
                    icon: () => <IconFolderAdd />
                  }}
                >
                  Create Folder
                </Button>
                {/* <Button
                  type="primary"
                  size="small"
                  v-slots={{
                    icon: () => <IconUpload />
                  }}
                >
                  Upload File
                </Button> */}
              </div>
            </div>
            <div class="warehouses-main-content">
              <div class="container">
                <div class="container-header">Folders</div>
                <div class="container-body">{generateFolderList()}</div>
              </div>
              <div class="container">
                <div class="container-header">Files</div>
                <div class="container-body">
                  <WsFileCard filename="filename.pdf" filesize={123456345} />
                  <WsFileCard filename="filename-word.doc" filesize={34566543} />
                </div>
              </div>
            </div>
          </div>
          {/* aside */}
          <WsFolderDetails activeId="1" />
        </div>
      </div>
    )
  }
})
