<script setup lang="ts">
  import type { Component } from 'vue'
  import type Canvas from 'diagram-js/lib/core/Canvas'
  import type { Label } from 'bpmn-js/lib/model/Types'
  import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
  import { find } from 'min-dash'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { debounce } from '@/utils/debounce'
  import BpmnIconMap from '@/utils/BpmnIconMap'
  import EventEmitter from '@/utils/EventEmitter'
  import getBpmnIconType from '@/utils/get-bpmn-icon-type'
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'

  import ShapeGeneration from '@/components/Panel/children/ShapeGeneration.vue'
  import {
    isErrorSupported,
    isMessageSupported,
    isSignalSupported,
    isTimerSupported
  } from '@/utils/event-definition-utils'
  import GlobalConfiguration from '@/components/Panel/children/GlobalConfiguration.vue'
  import ShapeSignal from '@/components/Panel/children/ShapeSignal.vue'
  import ShapeMessage from '@/components/Panel/children/ShapeMessage.vue'
  import ShapeTime from '@/components/Panel/children/ShapeTime.vue'
  import ShapeError from '@/components/Panel/children/ShapeError.vue'
  import ShapeDocumentation from '@/components/Panel/children/ShapeDocumentation.vue'
  import ShapeExtensionProperties from '@/components/Panel/children/ShapeExtensionProperties.vue'
  import {
    isExecutionListenerSupported,
    isFormBindingSupported,
    isUserTaskSupported,
    isConditionalFlowSupported,
    isMultiinstanceSupported,
    isScriptTaskSupported,
    isServiceTaskSupported,
    isCallActivitySupported
  } from '@/utils/element-supported'
  import ExecutionListener from '@/components/Panel/children/ExecutionListener.vue'
  import SequenceFlow from '@/components/Panel/children/SequenceFlow.vue'
  import NodeForm from '@/components/Panel/children/NodeForm.vue'
  import TaskListener from '@/components/Panel/children/TaskListener.vue'
  import UserTaskFreeApproval from '@/components/Panel/children/UserTaskFreeApproval.vue'
  import UserTask from '@/components/Panel/children/UserTask.vue'
  import MultiInstance from '@/components/Panel/children/MultiInstance.vue'
  import ServiceTask from '@/components/Panel/children/ServiceTask.vue'
  import CallActivity from '@/components/Panel/children/CallActivity.vue'
  import ScriptTask from '@/components/Panel/children/ScriptTask.vue'
  import MicroServiceTask from '@/components/Panel/children/MicroServiceTask.vue'
  import MailServiceTask from '@/components/Panel/children/MailServiceTask.vue'
  import MessageServiceTask from '@/components/Panel/children/MessageServiceTask.vue'
  import RestServiceTask from '@/components/Panel/children/RestServiceTask.vue'
  import HttpServiceTask from '@/components/Panel/children/HttpServiceTask.vue'
  import DmnServiceTask from '@/components/Panel/children/DmnServiceTask.vue'
  import CopyServiceTask from '@/components/Panel/children/CopyServiceTask.vue'
  import { clearStorage } from './common/utils'

  defineOptions({ name: 'BpmnPanel' })

  const bpmnModeler = inject(modelerKey)!

  const presetPanel: string[] = [
    'ShapeSignal',
    'ShapeTime',
    'ShapeMessage',
    'ShapeError',
    'SequenceFlow',
    'UserTask',
    'ScriptTask',
    'CallActivity',
    'ServiceTask',
    'CopyServiceTask',
    'CamelServiceTask',
    'ScServiceTask',
    'MailServiceTask',
    'MqServiceTask',
    'RestServiceTask',
    'HttpServiceTask',
    'DmnServiceTask'
  ]

  const childServiceTask = {
    copy: CopyServiceTask,
    // camel: CamelServiceTask,
    sc: MicroServiceTask,
    mail: MailServiceTask,
    mq: MessageServiceTask,
    rest: RestServiceTask,
    http: HttpServiceTask,
    dmn: DmnServiceTask
  }

  const panelState = ref(true)
  const renderComponents = shallowRef<Component[]>([])
  const currentElement = shallowRef<BpmnElement | undefined>()
  const currentElementId = ref<string | undefined>()
  const bpmnIconName = ref<string>('Process')
  const bpmnElementName = ref<string>('Process')
  const defaultOpenPanel = ref<string[]>([...presetPanel])

  function getModule<T>(moduleName: string): T {
    return bpmnModeler!.value!.get(moduleName) as T
  }

  // 设置选中元素，更新注入数据
  const setCurrentElement = debounce({ delay: 200 }, (element?: BpmnElement) => {
    try {
      let activatedElement: BpmnElement | undefined = element

      if (!activatedElement) {
        activatedElement = getModule<Canvas>('canvas').getRootElement() as BpmnElement

        if (!activatedElement || !activatedElement.type) {
          return console.warn('No Element found!')
        }
      }

      // 处理标签类型节点
      if (activatedElement.type === 'label') {
        activatedElement = (activatedElement as Label).labelTarget as BpmnElement
      }

      const activatedElementTypeName = getBpmnIconType(activatedElement)

      if (is(activatedElement, 'bpmn:Collaboration')) {
        bpmnElementName.value = 'Process'
        bpmnIconName.value = BpmnIconMap.Process
      } else {
        bpmnElementName.value = activatedElementTypeName
        bpmnIconName.value = BpmnIconMap[activatedElementTypeName]
      }
      currentElement.value = activatedElement
      currentElementId.value = activatedElement.id

      setCurrentComponents()

      nextTick(() => {
        EventEmitter.emit('element-update', activatedElement)
      })
    } catch (e) {
      console.error(e)
    }
  })

  // 更新属性面板
  const setCurrentComponents = () => {
    // 清空
    const newComponents: Component[] = [ShapeGeneration]

    // 流程全局事件
    if (!currentElement.value.parent) newComponents.push(GlobalConfiguration)
    // 信号
    if (isSignalSupported(currentElement.value)) newComponents.push(ShapeSignal)
    // 消息
    if (isMessageSupported(currentElement.value)) newComponents.push(ShapeMessage)
    // 定时
    if (isTimerSupported(currentElement.value)) newComponents.push(ShapeTime)
    // 错误
    if (isErrorSupported(currentElement.value)) newComponents.push(ShapeError)
    // 顺序流条件
    if (isConditionalFlowSupported(currentElement.value)) newComponents.push(SequenceFlow)
    if (isUserTaskSupported(currentElement.value)) {
      // 任务配置
      newComponents.push(UserTask)
      // 自由配置
      newComponents.push(UserTaskFreeApproval)
      // 任务监听器
      newComponents.push(TaskListener)
    }
    // 脚本任务
    if (isScriptTaskSupported(currentElement.value)) {
      newComponents.push(ScriptTask)
    }
    // 服务任务
    if (isServiceTaskSupported(currentElement.value)) {
      const childType = currentElement.value?.businessObject.get('type')
      childType !== 'camel' && newComponents.push(childServiceTask[childType] || ServiceTask)
    }
    // 结构 callActivity
    if (isCallActivitySupported(currentElement.value)) {
      newComponents.push(CallActivity)
    }
    // 执行监听器
    if (isExecutionListenerSupported(currentElement.value)) newComponents.push(ExecutionListener)
    // 多实例
    if (isMultiinstanceSupported(currentElement.value)) {
      newComponents.push(MultiInstance)
    }
    // 表单配置
    if (isFormBindingSupported(currentElement.value)) newComponents.push(NodeForm)
    // 文档
    newComponents.push(ShapeExtensionProperties, ShapeDocumentation)

    // 重新赋值渲染
    renderComponents.value = newComponents
  }

  // 处理元素更改事件响应
  const setActiveChangeListener = () => {
    if (!bpmnModeler?.value) {
      console.log('属性面板初始化异常', 'bpmnModeler is undefined')
    }
    let onMoving = false
    // 导入完成后默认选中 process 节点
    bpmnModeler!.value!.on<any>(
      ['connectionSegment.move.start', 'shape.move.start', 'bendpoint.move.start'],
      () => {
        onMoving = true
      }
    )
    bpmnModeler!.value!.on<any>(
      ['connectionSegment.move.end', 'shape.move.end', 'bendpoint.move.end'],
      2000,
      () => {
        onMoving = false
      }
    )
    // 导入完成后默认选中 process 节点
    bpmnModeler!.value!.on<any>('root.added', ({ element }) => {
      setCurrentElement(element)
    })
    // 元素模板改变时触发
    bpmnModeler!.value!.on<any>('elementTemplates.changed', () => {
      setCurrentElement()
    })
    // 监听元素批量改变事件，修改当前激活的元素以及表单
    bpmnModeler!.value!.on<any>('elements.changed', ({ elements = [] }) => {
      // 保证 修改 "默认流转路径" 等类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
      const updatedElement = findElement(elements, currentElement.value)

      if (updatedElement && elementExists(updatedElement)) {
        setCurrentElement(updatedElement)
      }
    })
    // 监听选择事件，修改当前激活的元素以及表单
    bpmnModeler!.value!.on<any>('selection.changed', ({ newSelection = [] }) => {
      if (onMoving || currentElement.value === newSelection[0]) return

      setCurrentElement(newSelection[0])

      // 展开默认面板
      if (!newSelection[0]) {
        defaultOpenPanel.value = ['ShapeGeneration']
      } else {
        defaultOpenPanel.value = [...presetPanel]
      }
    })
  }

  function findElement(elements, element) {
    return find(elements, (e) => e === element)
  }
  function elementExists(element) {
    return element && bpmnModeler!.value!.get<ElementRegistry>('elementRegistry').get(element.id)
  }

  watchEffect(() => {
    if (bpmnModeler?.value) {
      setActiveChangeListener()
      // 清除缓存的全局数据
      clearStorage()
    }
  })

  provide(currentElementKey, currentElement)
  provide(getModuleKey, getModule)
</script>

<template>
  <a-config-provider :locale="zhCN" size="small">
    <div class="bpmn-properties-panel" :class="{ open: panelState }">
      <div class="toggle-btn" @click="panelState = !panelState">
        <icon-double-left />
      </div>
      <div class="properties-penal_header">
        <BpmnIcon :name="bpmnIconName" :size="30"></BpmnIcon>
        <p>{{ $t(bpmnElementName) }}</p>
      </div>
      <div class="properties-penal_content">
        <a-collapse
          v-model:active-key="defaultOpenPanel"
          :bordered="false"
          expand-icon-position="right"
          size="small"
          style="border-radius: 0"
        >
          <component :is="c" v-for="c in renderComponents" :key="c['__name']" />
        </a-collapse>
      </div>
    </div>
  </a-config-provider>
</template>
