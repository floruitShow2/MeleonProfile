import {
  PropType,
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  toRefs,
  watchEffect,
  watch
} from 'vue'
import { useUserStore } from '@/store'
import { FetchFolloweeList } from '@/api/instrument/chat'
import { useAvatar } from '@/utils/global'
import { Swiper, SwiperSlide } from 'swiper/vue'
import {
  getEditorRange,
  transformNodeListToMentionData,
  transformMentionDataToNodeList
} from './utils'
import { IMention, NodeType } from './type'
import type { INode } from './type'
import './index.less'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    mentions: {
      type: Array as PropType<IMention[]>,
      default: () => []
    },
    maxLength: {
      type: Number,
      default: -1
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['focus', 'blur', 'change', 'update:modelValue'],
  setup(props, { emit, expose }) {
    // 转换 props 属性
    const { modelValue, mentions, maxLength, disabled } = toRefs(props)
    const userStore = useUserStore()

    // 输入框 DOM 实例
    const editorRef = ref()
    const focusEditor = () => {
      if (!editorRef.value) return
      editorRef.value.focus()
    }
    // 记录输入框中的文本信息
    const inputStr = ref('')

    // 初始化操作
    const isInit = ref(false)
    const init = () => {
      const nodeList = transformMentionDataToNodeList(modelValue.value, mentions.value)
      if (!editorRef.value) return
      nodeList.forEach((node) => {
        if (node.type === NodeType.text) {
          const textNode = document.createTextNode(node.data as string)
          editorRef.value?.appendChild(textNode)
        }
        if (node.type === NodeType.at) {
          const btn = document.createElement('button')
          btn.dataset.person = JSON.stringify(node.data)
          btn.textContent = `@${(node.data as ApiUserManagement.User).userName}`
          btn.className = 'at-mention-button'
          btn.contentEditable = 'false'
          btn.addEventListener(
            'click',
            () => {
              alert(`This is aaa`)
            },
            false
          )
          btn.tabIndex = 0
          editorRef.value?.appendChild(btn)
        }
      })
      isInit.value = true
    }
    watchEffect(() => {
      // 仅在加载时初始化
      if (modelValue.value && modelValue.value.length > 0 && !isInit.value) {
        init()
      }
      // 初始化value为空处理
      if (!(modelValue.value && modelValue.value.length > 0) && !isInit.value) {
        setTimeout(() => {
          init()
        }, 500)
      }
      // 清空输入
      if (!(modelValue.value && modelValue.value.length > 0) && isInit && editorRef.value) {
        while (editorRef.value?.firstChild) {
          editorRef.value.removeChild(editorRef.value.firstChild)
        }
      }
      inputStr.value = modelValue.value
    })
    // 禁用解除后自动获取焦点。
    watch(disabled, (newVal) => {
      if (!newVal) {
        setTimeout(() => {
          focusEditor()
        })
      }
    })

    const isPopoverShow = ref(false)
    const popoverComponent = ref<'at-users' | 'reply'>('at-users')

    // 输入 @ 后，继续输入的查询条件
    const searchQuery = ref('')
    const followeesList = ref<ApiUserManagement.User[]>([])
    const computedUsersList = computed(() =>
      followeesList.value.filter((user) => user.userName.indexOf(searchQuery.value) !== -1)
    )
    // 备份光标的位置信息
    const editorRange = ref<{ range: Range; selection: Selection } | null>(null)

    // 当输入框值发生变化时，解析它的数据，并回传
    const onDataChangeCallBack = () => {
      if (editorRef.value) {
        const nodeList: INode[] = []
        const editorChildNodes = [].slice.call(
          editorRef.value.childNodes
        ) as unknown as NodeListOf<ChildNode>
        // 遍历输入框内所有子节点，根据节点的类型执行对应操作
        if (editorChildNodes.length > 0) {
          editorChildNodes.forEach((element) => {
            // 文本
            if (element.nodeName === '#text') {
              const el = element as Text
              if (el.data && el.data.length > 0) {
                nodeList.push({
                  type: NodeType.text,
                  data: el.data
                })
              }
            }
            // br换行
            if (element.nodeName === 'BR') {
              nodeList.push({
                type: NodeType.br,
                data: '\n'
              })
            }
            // button
            if (element.nodeName === 'BUTTON') {
              const el = element as HTMLButtonElement
              const personInfo = JSON.parse(el.dataset.person as string)
              nodeList.push({
                type: NodeType.at,
                data: personInfo
              })
            }
          })
        }
        console.log(nodeList, editorChildNodes)
        const { pureString, mentionList } = transformNodeListToMentionData(nodeList)
        // 文本末尾换行出现两个换行符处理
        if (pureString.length > 0 && pureString.charAt(pureString.length - 1) === '\n') {
          emit('change', pureString.substring(0, pureString.length - 1), mentionList)
        } else {
          emit('change', pureString, mentionList)
        }
      }
    }
    const checkIsShowSelectPopover = () => {
      const rangeInfo = getEditorRange()
      if (!rangeInfo || !rangeInfo.range || !rangeInfo.selection) {
        isPopoverShow.value = false
        return
      }
      const curNode = rangeInfo.range.endContainer
      if (!curNode || !curNode.textContent || curNode.nodeName !== '#text') {
        isPopoverShow.value = false
        return
      }
      const contentStr = curNode.textContent.slice(0, rangeInfo.selection.focusOffset)
      // 判断光标位置前方是否有 @ ，只有一个 @ 则展示默认dialog，除了 @ 还有关键字则展示searchDialog
      const keywords = /@([^@]*)$/.exec(contentStr)
      if (keywords && keywords.length >= 2) {
        // 展示搜索选人
        const [, keyWord] = keywords
        // 搜索关键字不超过20个字符
        if (keyWord && keyWord.length > 20) {
          isPopoverShow.value = false
          searchQuery.value = ''
          return
        }

        isPopoverShow.value = true
        searchQuery.value = keyWord

        // 当可以 @ 的用户列表为空时，隐藏弹出框
        if (computedUsersList.value.length === 0) {
          isPopoverShow.value = false
          return
        }
        // 记下弹窗前光标位置range
        editorRange.value = rangeInfo
      } else {
        // 关掉选人窗口
        searchQuery.value = ''
        isPopoverShow.value = false
      }
    }

    const onInputKeyUp = (e: KeyboardEvent) => {
      if (e.key === '@' && e.shiftKey) {
        isPopoverShow.value = true
      } else {
        checkIsShowSelectPopover()
      }
    }
    // @ 成员功能操作逻辑
    // 初始化成员列表
    onBeforeMount(async () => {
      const { data } = await FetchFolloweeList(userStore.getName)
      if (!data) return
      followeesList.value = data
    })

    // 将 @成员 按钮插入到输入框中
    const insertHtmlAtCaret = (
      [btnRef, btnSpaceNode]: [HTMLButtonElement, Text],
      selection: Selection,
      range: Range
    ) => {
      if (selection.getRangeAt(0) && selection.rangeCount) {
        if (selection.focusNode?.parentNode?.nodeName === 'BUTTON') return
        range.deleteContents()
        const el = document.createElement('div')
        el.appendChild(btnRef)
        if (btnSpaceNode) {
          el.appendChild(btnSpaceNode)
        }
        const frag = document.createDocumentFragment()
        let node
        let lastNode
        while (el.firstChild) {
          node = el.firstChild
          lastNode = frag.appendChild(node)
        }
        range.insertNode(frag)
        if (lastNode) {
          range = range.cloneRange()
          range.setStartAfter(lastNode)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }

    // 清除现有的 @标识符及查询条件，生成 @成员 按钮
    const generateAtMention = (user: ApiUserManagement.User) => {
      // 选择人员后关闭弹出层，并重置相关参数
      isPopoverShow.value = false
      searchQuery.value = ''
      focusEditor()
      const curEditorRange = editorRange.value?.range
      if (!curEditorRange) return
      const { endContainer, endOffset } = curEditorRange // 拿到末尾文本节点 及 光标位置
      const textNodeValue = endContainer.nodeValue as string
      const expRes = /@([^@]*)$/.exec(textNodeValue)
      if (expRes && expRes.length > 1) {
        // 删除 @及其后面的查询条件
        curEditorRange.setStart(endContainer, expRes.index)
        curEditorRange.setEnd(endContainer, endOffset)
        curEditorRange.deleteContents()
        // 创建 @button
        const btnRef = document.createElement('button')
        btnRef.dataset.person = JSON.stringify(user)
        btnRef.textContent = `@${user.userName}`
        btnRef.className = 'at-mention-button'
        btnRef.contentEditable = 'false'
        btnRef.onclick = () => {
          alert(`This is ${user.userName}`)
        }
        const btnSpaceNode = document.createTextNode('\u00A0')
        insertHtmlAtCaret(
          [btnRef, btnSpaceNode],
          editorRange.value?.selection as Selection,
          editorRange.value?.range as Range
        )
      }
      onDataChangeCallBack()
    }

    const handleSwiperClick = (swiper: { clickedIndex: number }) => {
      const selectUser = computedUsersList.value[swiper.clickedIndex]
      generateAtMention(selectUser)
    }

    const getPopoverComponent = (component: 'at-users' | 'reply') => {
      switch (component) {
        case 'at-users':
          return (
            computedUsersList.value.length > 0 && (
              <div class="popover-at-users">
                <Swiper slides-per-view={8} space-between={20} onClick={handleSwiperClick}>
                  {computedUsersList.value.map((user) => (
                    <SwiperSlide class="at-user">
                      <img src={useAvatar()} alt={user.userName} />
                      <span>{user.userName}</span>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {}
              </div>
            )
          )
          break
        default:
          return <></>
          break
      }
    }

    const onInputBlur = () => {
      emit('blur')
    }

    const onInputFocus = () => {
      emit('focus')
      // 聚焦时是否展示选人弹窗
      checkIsShowSelectPopover()
    }

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      let pastedText = ''
      if (e.clipboardData) {
        pastedText = e.clipboardData.getData('text/plain')
      }
      document.execCommand('insertHTML', false, pastedText)
      return false
    }

    const onInputText = () => {
      if (editorRef.value) {
        const text = editorRef.value.innerText
        inputStr.value = text
        emit('update:modelValue', text)
      }
      onDataChangeCallBack()
    }

    // 对外暴露方法
    expose({ focusEditor })

    return () => (
      <div class="ws-chat-input">
        {/* 输入框 */}
        <div
          class={{
            'ws-chat-input_wrapper': true,
            'is-disabled': disabled.value
          }}
          ref={editorRef}
          contenteditable={!disabled.value}
          onKeyup={onInputKeyUp}
          onBlur={onInputBlur}
          onFocus={onInputFocus}
          onMouseup={checkIsShowSelectPopover}
          onInput={onInputText}
          onPaste={onPaste}
        />
        {/* @成员弹出层 */}
        {isPopoverShow.value && (
          <div class="ws-chat-input_popover">{getPopoverComponent(popoverComponent.value)}</div>
        )}
        {/* 回复信息弹出层 */}
      </div>
    )
  }
})
