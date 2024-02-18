import { defineComponent, ref } from 'vue'
import { Upload, Select, Option, Button, Modal } from '@arco-design/web-vue'
import type { FileItem } from '@arco-design/web-vue'
import { UploadBlogs } from '@/api/articles'
import { getBlogTags } from '@/api/tag'
import type { BlogTagType } from '@/api/tag'
import { readFileAsText } from '@/utils/file/parse'
import './index.less'

export default defineComponent({
  emits: ['skip'],
  setup(props, { emit }) {
    const uploadTip = '暂时仅支持上传 MD 文档。请在上传前检查文档图片路径，本地路径的图片会上传失败'

    const showFilesList = ref<boolean>(false)
    const blogFileList = ref<Partial<ApiArticle.ArticleEntity>[]>([])
    const blogTags = ref<BlogTagType[]>([])
    const handleFileListChange = async (fileList: FileItem[]) => {
      const { data } = await getBlogTags()
      blogTags.value = data ?? []
      showFilesList.value = true
      blogFileList.value = []
      fileList.forEach(async (file, index) => {
        const blogContent = file.file ? await readFileAsText(file.file) : ''
        blogFileList.value[index] = {
          title: file.name || '',
          description: blogContent.slice(0, 100),
          content: blogContent,
          status: 'notPassed',
          tags: []
        }
      })
    }

    const renderFileList = (): JSX.Element[] => {
      return blogFileList.value.map((blog) => {
        return (
          <div class="blog-list-item">
            <span class="blog-name">{blog.title}</span>
            <Select v-model:modelValue={blog.tags} size="small" multiple allow-search={false}>
              {blogTags.value.map((tag) => {
                return <Option label={tag.tagName} value={tag.tagName} />
              })}
            </Select>
          </div>
        )
      })
    }

    // 提示弹窗
    const showModal = ref<boolean>(false)
    const handleConfirmUpload = async () => {
      const { data } = await UploadBlogs(blogFileList.value)
      if (data) {
        // 上传成功
        showModal.value = true
      }
    }

    const handleModalOK = () => {
      emit('skip', 'articleMenu')
    }
    const handleModalCancel = () => {
      showModal.value = true
      showFilesList.value = false
      blogFileList.value = []
    }

    return () => (
      <div class="import-wrapper">
        {showFilesList.value ? (
          <div class="blog-upload">
            <div class="blog-header">
              <h4>文章列表</h4>
              {/* <Checkbox v-model:modelValue={isCheckAll.value}></Checkbox> */}
            </div>
            <div class="blog-list">{renderFileList()}</div>
            <div class="blog-footer">
              <Button type="secondary" size="medium" onClick={handleConfirmUpload}>
                确认并发布
              </Button>
            </div>
          </div>
        ) : (
          <Upload
            draggable
            action="/"
            tip={uploadTip}
            multiple
            autoUpload={false}
            showFileList={false}
            onChange={handleFileListChange}
          />
        )}

        <Modal
          v-model:visible={showModal.value}
          v-slots={{
            title: '上传成功',
            default: <p>博客文件已经上传至服务器，是否跳转文章管理查看详情？</p>
          }}
          onOk={handleModalOK}
          onCancel={handleModalCancel}
        />
      </div>
    )
  }
})
