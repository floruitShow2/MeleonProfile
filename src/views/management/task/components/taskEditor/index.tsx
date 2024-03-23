import { PropType, defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Avatar,
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
  FileItem,
  Message
} from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { TagColorMap, StaticTags, TypeColorMap } from '@/constants/tag'
import { AddCover, CreateTask, DeleteCover, UpdateTask } from '@/api/task'
import { FetchTeamList } from '@/api/team'
import WsAvatar from '@/components/avatar'
// import WsAvatarGroup from '@/components/avatarGroup'
// import WsFileCard from '@/components/fileCard'
import { readFileAsDataurl } from '@/utils/file/parse'
import { formatToDateTime, useDeepClone } from '@/utils/format'
import { isEmptyObject } from '@/utils/is'
import { initImageViewer } from '@/components/NewImageViewer/mount'
import './index.less'

export default defineComponent({
  props: {
    // 任务所属分组
    group: {
      type: String,
      required: true
    },
    task: {
      type: Object as PropType<ApiTask.TaskEntity>,
      default: () => ({})
    }
  },
  setup(props, { expose }) {
    const prefix = 'task-editor'

    const { task: TaksProps } = toRefs(props)

    const userStore = useUserStore()
    const { username, avatar } = userStore.userInfo

    const router = useRouter()

    // 任务实体
    const taskDetails = ref<ApiTask.TaskEntity>({
      group: '',
      teamId: '',
      title: '',
      desc: '',
      coverImage: '',
      startTime: '',
      endTime: '',
      tags: [],
      relatives: [],
      comments: 0
    })
    // 初始化团队列表
    const teamOptions = ref<ApiTeam.TeamEntity[]>([])
    const initOptions = async () => {
      const { data } = await FetchTeamList()
      if (!data) return
      teamOptions.value = data
    }
    // 将团队实体 渲染为 JSX
    const renderTeamOptions = (teams: ApiTeam.TeamEntity[]): JSX.Element[] => {
      return teams.map((team) => (
        <Option value={team.teamId}>
          <div class="selector-team-option">
            <Avatar size={32} imageUrl={team.logo}></Avatar>
            <span>{team.teamName}</span>
          </div>
        </Option>
      ))
    }
    // 跳转至创建团队页面
    const goToTeamCreate = () => {
      router.push({
        path: '/profile/overview',
        query: {
          code: 'teamMenu'
        }
      })
    }
    onMounted(async () => {
      await initOptions()
    })

    const timeRange = ref<string[]>([])

    /**
     * @description 选中指定 tag
     * @param value "code" property of tag
     */
    const handleTagSelect = (value: unknown) => {
      taskDetails.value.tags.push(value as ApiTask.TagType)
    }
    /**
     * @description 用于判断是否已选中该 tag
     * @param tag
     * @returns boolean
     */
    const hasExistingTag = (tag: ApiTask.TagType) => {
      const idx = taskDetails.value.tags.findIndex((item) => item.label === tag.label)
      return idx !== -1
    }
    /**
     * @description 移除选中的 tag
     * @param tag
     */
    const handleTagRemove = (tag: string) => {
      taskDetails.value = {
        ...taskDetails.value,
        tags: taskDetails.value.tags.filter((item) => item.label !== tag)
      }
      console.log(taskDetails.value.tags)
    }

    // 封面
    // const coverImageUrl = ref<string>('')
    const uploadCoverage = ref<File>()
    const handlePreviewCover = () => {
      const cover = taskDetails.value.coverImage ?? ''
      if (!cover) return
      console.log('start to preview cover!!')
      initImageViewer({ images: [cover] })
    }
    const handleCoverChange = async (fileList: FileItem[]) => {
      const { file } = fileList[0]
      if (!file) return
      uploadCoverage.value = file

      const { taskId } = taskDetails.value
      if (taskId) {
        const fd = new FormData()
        fd.append('cover', file)
        fd.append('taskId', taskDetails.value.taskId ?? '')
        const { data } = await AddCover(fd)
        taskDetails.value.coverImage = data ?? ''
      } else {
        taskDetails.value.coverImage = await readFileAsDataurl(file)
      }
    }
    const handleDeleteCover = async () => {
      const { taskId } = taskDetails.value
      if (taskId) {
        try {
          await DeleteCover(taskId)
          taskDetails.value.coverImage = ''
        } catch (error) {
          console.log('error =>', error)
        }
      } else {
        taskDetails.value.coverImage = ''
      }
    }

    // 附件
    // const uploadAttachments = ref<FileItem[]>([])
    // const handleAttachmentsChange = (filesList: FileItem[]) => {
    //   uploadAttachments.value = filesList
    //   const newFile = filesList.at(-1)
    //   if (!newFile) return
    //   const findIdx = filesList.findIndex((file) => file.name === newFile.name)
    //   if (findIdx !== -1) uploadAttachments.value.splice(findIdx, 1, newFile)
    //   else uploadAttachments.value.push(newFile)
    // }

    // 校验准备创建的任务信息是否符合要求
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

      return errorMessage.length === 0
    }
    const handleCreateTask = async () => {
      return new Promise((resolve, reject) => {
        const details = {
          ...taskDetails.value,
          group: props.group,
          startTime: formatToDateTime(timeRange.value[0]),
          endTime: formatToDateTime(timeRange.value[1])
        }
        if (!validateDetails(details)) {
          Message.error({
            content: '数据校验未通过，请填写完整'
          })
          reject()
          return
        }

        const fd = new FormData()
        if (uploadCoverage.value) fd.append('cover', uploadCoverage.value)
        // uploadAttachments.value.forEach((item) => {
        //   if (item.file) fd.append('attachments', item.file)
        // })

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
    const handleUpdateTask = () => {
      console.log('update the task you selected')
      return new Promise((resolve, reject) => {
        const details = {
          ...taskDetails.value,
          group: props.group,
          startTime: formatToDateTime(timeRange.value[0]),
          endTime: formatToDateTime(timeRange.value[1])
        }
        if (!validateDetails(details)) {
          Message.error({
            content: '数据校验未通过，请填写完整'
          })
          reject()
        }
        const { taskId, relatives, ...rest } = details
        UpdateTask(taskId ?? '', rest)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    watch(
      TaksProps,
      (newVal) => {
        if (newVal && !isEmptyObject(newVal)) {
          const { startTime, endTime } = newVal
          timeRange.value = [startTime, endTime]
          taskDetails.value = useDeepClone(newVal)
        }
      },
      { deep: true, immediate: true }
    )

    expose({
      createTask: handleCreateTask,
      updateTask: handleUpdateTask
    })

    return () => (
      <div class={prefix}>
        <div class={[`${prefix}-module`, 'creator']}>
          <h4>创建人</h4>
          <div class="module-content">
            <WsAvatar imgUrl={avatar} shape="circle" background="#FFFFFF" />
            <span>{username}</span>
          </div>
        </div>
        {/* <div class={[`${prefix}-module`, 'relatives']}>
          <h4>关联成员</h4>
          <div class="module-content">
            <WsAvatarGroup maxCount={3}>
              {taskDetails.relatives.map((user) => (
                <WsAvatar size={28}>{user}</WsAvatar>
              ))}
            </WsAvatarGroup>
            <i class="iconfont ws-plus ibtn_base ibtn_hover"></i>
          </div>
        </div> */}
        <div class={[`${prefix}-module`, 'team']}>
          <h4>所属团队(可选)</h4>
          <div class="module-content">
            <Select
              v-model:modelValue={taskDetails.value.teamId}
              placeholder="无归属团队，请选择"
              v-slots={{
                default: () => renderTeamOptions(teamOptions.value),
                empty: () => (
                  <div class="selector-team-empty">
                    没有团队？<span onClick={goToTeamCreate}>现在去创建</span>
                  </div>
                )
              }}
            />
          </div>
        </div>
        <div class={[`${prefix}-module`, 'title']}>
          <h4>标题</h4>
          <div class="module-content">
            <Input
              v-model:modelValue={taskDetails.value.title}
              size="small"
              placeholder="请输入"
            ></Input>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'desc']}>
          <h4>描述信息</h4>
          <div class="module-content">
            <Textarea
              v-model:modelValue={taskDetails.value.desc}
              maxLength={100}
              show-word-limit
              placeholder="请输入"
            ></Textarea>
          </div>
        </div>
        <div class={[`${prefix}-module`, 'cover']}>
          <h4>上传封面</h4>
          <div class="module-content">
            {taskDetails.value.coverImage ? (
              <div class="cover-image">
                <div class="tools">
                  <i class="iconfont ws-view ibtn_base ibtn_hover" onClick={handlePreviewCover} />
                  <i class="iconfont ws-delete ibtn_base ibtn_hover" onClick={handleDeleteCover} />
                </div>
                <img src={taskDetails.value.coverImage} alt="" />
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
        {/* <div class={[`${prefix}-module`, 'priority']}>
          <h4>优先级</h4>
          <div class="module-content">
            <Select
              v-model:modelValue={taskDetails.value.priority}
              style="width: fit-content"
              size="mini"
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
        </div> */}
        <div class={[`${prefix}-module`, 'tags']}>
          <h4>标签</h4>
          <div class="module-content">
            {taskDetails.value.tags.map((tag) => (
              <Tag
                size="medium"
                closable
                key={tag.code}
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
        {/* 附件 */}
        {/* <div class={[`${prefix}-module`, 'attachments']}>
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
        </div> */}
      </div>
    )
  }
})
