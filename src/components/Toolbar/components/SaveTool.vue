<script lang="ts" setup>
  import { onUnmounted } from 'vue'
  import { modelerKey } from '@/injection-keys'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { getExExtensionElementsList } from '@/utils/extension-elements-utils'
  import { saveBpmnModel } from '@/api/bpmn'
  import { Message, Modal } from '@arco-design/web-vue'
  import type Modeler from 'bpmn-js/lib/Modeler'
  import EventEmitter from '@/utils/EventEmitter'

  let issuesMap: Record<string, any[]> = {}
  let issuesCount: Record<string, number> = {}

  const modeler = inject(modelerKey)

  const onLoading = ref(false)

  const saveProcessXML = async () => {
    try {
      onLoading.value = true
      let data: any
      const { xml } = await modeler!.value!.saveXML({ format: true, preamble: true })
      const root = modeler!.value!.get<Canvas>('canvas').getRootElement()
      if (is(root, 'bpmn:Collaboration')) {
        const process = root.children[0].businessObject.processRef
        const modelKey = process.id
        const modelName = process.name
        const processNameExpEl = getExExtensionElementsList(process, 'ProcessNameExp')?.[0]
        const processNameExp = processNameExpEl?.get('body')

        data = await saveBpmnModel({
          modelKey,
          modelName,
          modelXml: xml,
          processNameExp
        })
      } else {
        const modelKey = root.businessObject['id']
        const modelName = root.businessObject['name']
        const processNameExpEl = getExExtensionElementsList(
          root.businessObject,
          'ProcessNameExp'
        )?.[0]
        const processNameExp = processNameExpEl?.get('body')
        data = await saveBpmnModel({
          modelKey,
          modelName,
          modelXml: xml,
          processNameExp
        })
      }

      if (data.success) {
        Message.success('保存成功')
      } else {
        Message.error('保存失败')
      }
    } catch (e) {
      console.error(e)
    } finally {
      onLoading.value = false
    }
  }

  const saveValidateXml = () => {
    const errorLen = issuesCount.error || 0

    if (errorLen > 0) {
      Modal.warning({
        title: '警告',
        content: `目前流程图存在 ${errorLen} 个错误, 确定要保存吗？`,
        okText: '确定',
        cancelText: '取消',
        hideCancel: false,
        onOk: saveProcessXML
      })
    } else {
      saveProcessXML()
    }
  }

  const initCallback = (modeler: Modeler) => {
    modeler.on('bpmn-linting.completed', ({ issues, count }: any) => {
      issuesMap = issues
      issuesCount = count
    })
  }
  // 监听 modeler 实例化事件
  EventEmitter.on('modeler-init', initCallback)

  onUnmounted(() => {
    EventEmitter.removeListener('modeler-init', initCallback)
  })
</script>

<template>
  <a-button :loading="onLoading" type="primary" secondary @click="saveValidateXml">
    <LucideIcon name="Save" :size="16" />
    {{ $t('saveModel') }}
  </a-button>
</template>
