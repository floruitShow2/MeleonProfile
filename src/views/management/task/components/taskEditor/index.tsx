import { defineComponent, reactive, ref } from 'vue'
import {
  RangePicker,
  Select,
  Option,
  Tag,
  Button,
  Dropdown,
  Doption,
  Input,
  Textarea,
  Upload,
  FileItem
} from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { TagColorMap, StaticTags, TypeColorMap } from '@/constants/tag'
import WsAvatar from '@/components/avatar'
import WsAvatarGroup from '@/components/avatarGroup'
import WsFileCard from '@/components/fileCard'
import { CreateTask } from '@/api/task'
import { readFileAsDataurl } from '@/utils/file/parse'
import { formatToDateTime } from '@/utils/format'
import './index.less'

export default defineComponent({
  props: {
    group: {
      type: String,
      required: true
    }
  },
  setup(props, { expose }) {
    const prefix = 'task-editor'

    const userStore = useUserStore()
    const { username, avatar } = userStore.userInfo

    const taskDetails = reactive<ApiTask.TaskEntity>({
      group: '',
      title: '',
      desc: '',
      priority: 1,
      coverImage: '',
      startTime: '',
      endTime: '',
      tags: [],
      relatives: [],
      comments: 0
    })
    const timeRange = ref<string[]>([])
    const handleTagSelect = (value: unknown) => {
      taskDetails.tags.push(value as ApiTask.TagType)
    }

    const hasExistingTag = (tag: ApiTask.TagType) => {
      const idx = taskDetails.tags.findIndex((item) => item.label === tag.label)
      return idx !== -1
    }
    const handleTagRemove = (tag: string) => {
      taskDetails.tags = taskDetails.tags.filter((item) => item.label !== tag)
    }

    const coverImageUrl = ref<string>('')
    const uploadCoverage = ref<File>()
    const handleCoverChange = async (fileList: FileItem[]) => {
      const { file } = fileList[0]
      if (!file) return
      uploadCoverage.value = file
      coverImageUrl.value = await readFileAsDataurl(file)
      taskDetails.coverImage = file.name
    }

    const uploadAttachments = ref<FileItem[]>([])
    const handleAttachmentsChange = (filesList: FileItem[]) => {
      uploadAttachments.value = filesList
      // const newFile = filesList.at(-1)
      // if (!newFile) return
      // const findIdx = filesList.findIndex((file) => file.name === newFile.name)
      // if (findIdx !== -1) uploadAttachments.value.splice(findIdx, 1, newFile)
      // else uploadAttachments.value.push(newFile)
    }

    const validateDetails = (details: ApiTask.TaskEntity) => {
      const { title, startTime, endTime } = details
      const errorMessage: Array<{
        prop: string
        message: string
      }> = []
      if (!title) {
        errorMessage.push({
          prop: 'title',
          message: '任务名为空值'
        })
      }
      if (!startTime || !endTime) {
        errorMessage.push({
          prop: 'range',
          message: '任务周期不能为空'
        })
      } else {
        const [startTimestamp, endTimestamp] = [
          new Date(startTime).getTime(),
          new Date(endTime).getTime()
        ]
        if (endTimestamp < startTimestamp) {
          errorMessage.push({
            prop: 'range',
            message: '截至时间不能小于开始时间'
          })
        }
      }

      console.log(errorMessage)
      return errorMessage.length === 0
    }
    const handleCreateTask = async () => {
      return new Promise((resolve, reject) => {
        const details = {
          ...taskDetails,
          group: props.group,
          startTime: formatToDateTime(timeRange.value[0]),
          endTime: formatToDateTime(timeRange.value[1])
        }
        if (!validateDetails(details)) return

        const fd = new FormData()
        if (uploadCoverage.value) fd.append('cover', uploadCoverage.value)
        uploadAttachments.value.forEach((item) => {
          if (item.file) fd.append('attachments', item.file)
        })

        fd.append('data', JSON.stringify(details))
        CreateTask(fd)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    expose({ createTask: handleCreateTask })

    return () => (
      <div class={prefix}>
        <div class={[`${prefix}-module`, 'creator']}>
          <h4>创建人</h4>
          <div class="module-content">
            <WsAvatar imgUrl={avatar} shape="circle" background="#FFFFFF" />
            <span>{username}</span>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'relatives']}>
          <h4>关联成员</h4>
          <div class="module-content">
            <WsAvatarGroup maxCount={3}>
              {taskDetails.relatives.map((user) => (
                <WsAvatar size={28}>{user}</WsAvatar>
              ))}
            </WsAvatarGroup>
            <i class="iconfont ws-plus ibtn_base ibtn_hover"></i>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'title']}>
          <h4>标题</h4>
          <div class="module-content">
            <Input v-model:modelValue={taskDetails.title} size="small" placeholder="请输入"></Input>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'desc']}>
          <h4>描述信息</h4>
          <div class="module-content">
            <Textarea
              v-model:modelValue={taskDetails.desc}
              maxLength={100}
              show-word-limit
              placeholder="请输入"
            ></Textarea>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'cover']}>
          <h4>上传封面</h4>
          <div class="module-content">
            {taskDetails.coverImage ? (
              <div class="cover-image">
                <div class="tools">
                  <i
                    class="iconfont ws-delete ibtn_base ibtn_hover"
                    onClick={() => {
                      taskDetails.coverImage = ''
                    }}
                  ></i>
                </div>
                <img src={coverImageUrl.value} alt="" />
              </div>
            ) : (
              <Upload
                autoUpload={false}
                accept="image/png, image/jpeg"
                show-file-list={false}
                v-slots={{
                  'upload-button': () => <div class="empty-cover">暂无封面，可点击上传</div>
                }}
                onChange={handleCoverChange}
              ></Upload>
            )}
          </div>
        </div>
        <div class={[`${prefix}-module`, 'priority']}>
          <h4>优先级</h4>
          <div class="module-content">
            <Select
              v-model:modelValue={taskDetails.priority}
              style="width: fit-content"
              size="mini"
              //   bordered={false}
              v-slots={{
                label: ({ data }: { data: { value: number; label: string } }) => (
                  <div class="selected-label">
                    {data.value === 0 && (
                      <i
                        class="iconfont ws-clock"
                        style={{
                          color: 'rgb(var(--red-6))'
                        }}
                      ></i>
                    )}
                    <span>{data.label || ''}</span>
                  </div>
                )
              }}
            >
              <Option value={0}>
                <span>紧急</span>
              </Option>
              <Option value={1}>
                <span>常规</span>
              </Option>
            </Select>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'tags']}>
          <h4>标签</h4>
          <div class="module-content">
            {taskDetails.tags.map((tag) => (
              <Tag
                size="medium"
                closable
                color={TagColorMap[tag.type]}
                onClose={() => handleTagRemove(tag.label)}
              >
                <span style={{ backgroundColor: TypeColorMap[tag.type] }}></span>
                <span>{tag.label}</span>
              </Tag>
            ))}
            <Dropdown
              onSelect={handleTagSelect}
              v-slots={{
                content: () => (
                  <>
                    {StaticTags.map((tag) => (
                      <Doption value={tag} disabled={hasExistingTag(tag)}>
                        {tag.label}
                      </Doption>
                    ))}
                  </>
                )
              }}
            >
              <Button size="mini" v-slots={{ icon: () => <i class="iconfont ws-plus" /> }}>
                添加标签
              </Button>
            </Dropdown>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'range']}>
          <h4>任务周期</h4>
          <div class="module-content">
            <RangePicker
              v-model:modelValue={timeRange.value}
              show-time
              time-picker-props={{ defaultValue: ['00:00:00', '23:59:59'] }}
              format="YYYY-MM-DD HH:mm"
            />
          </div>
        </div>
        <div class={[`${prefix}-module`, 'attachments']}>
          <div class="module-header">
            <h4>附件</h4>
            <Upload
              autoUpload={false}
              show-file-list={false}
              multiple
              v-slots={{
                'upload-button': () => <i class="iconfont ws-link ibtn_base ibtn_hover"></i>
              }}
              onChange={handleAttachmentsChange}
            ></Upload>
          </div>
          <div class="module-content">
            {uploadAttachments.value.map((file) => (
              <WsFileCard
                filename={file.name || ''}
                filesize={file.file ? file.file.size : 0}
                size="mini"
                tools={['view', 'delete']}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
})
