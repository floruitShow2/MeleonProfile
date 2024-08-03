<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import { getPlatformType } from '@/api/bpmn'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'
  import { InitRef } from '@/components/Panel/common/types'
  import {
    addExtensionElements,
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { updateModdleProps } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import { ref } from 'vue'
  import { debounce } from '@/utils/debounce'

  defineOptions({ name: 'CopyServiceTask' })

  const labelWidth = ref(146)
  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const messageTypeOps = ref<Array<{ label: string; value: string }>>([])
  const platformData = ref<InitRef<string>>()
  const platformSuccess = ref<InitRef<boolean>>()

  const messageTypeMap = {
    dingtalk: { label: t('DingtalkMessage'), value: 'dingtalk' },
    weixin: { label: t('WechatMessage'), value: 'weixin' },
    default: { label: t('FeishuMessage'), value: 'feishu' }
  }

  /**
   * 获取消息类型
   */
  const getPlatformMessageType = async () => {
    try {
      const { data, success } = await getPlatformType()
      platformData.value = data
      platformSuccess.value = success
      if (success && data) {
        messageTypeOps.value = [messageTypeMap[data] || messageTypeMap['default']]
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const bpmnModeler = modeler!.value!
    const modeling = bpmnModeler.get<Modeling>('modeling')
    return { element, modeling, bpmnModeler }
  }

  const transferToUserNos = ref<InitRef<string>>()
  const idmCandidateUsers = ref<Record<string, any>[]>([])
  const messageType = ref<string[]>([])

  const updateCopyUserNos = (transferToUserNosStr?: string) => {
    const commands: CommandContext[] = []
    const { element, bpmnModeler } = getElementAndModeling()

    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const fieldTransferUser = fieldEEs.filter((ex) => ex.name === 'transferToUserNos')[0]
    const transferToUserNos = idmCandidateUsers.value.map((i) => i.code).join(',')
    if (fieldTransferUser) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: fieldTransferUser,
          properties: { string: transferToUserNosStr || transferToUserNos }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'transferToUserNos',
            string: transferToUserNosStr || transferToUserNos
          })
        )
      )
    }

    const userExtensionElement = getExExtensionElementsList(
      element!.businessObject,
      'IdmCandidateUsers'
    )?.[0]
    if (userExtensionElement) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: userExtensionElement,
          properties: { body: JSON.stringify(idmCandidateUsers.value) }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'IdmCandidateUsers', {
            body: JSON.stringify(idmCandidateUsers.value)
          })
        )
      )
    }

    execPanelMultiCommands(bpmnModeler, commands)
  }

  const updateMessageType = () => {
    const { element, modeling, bpmnModeler } = getElementAndModeling()
    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const fieldEE = fieldEEs.filter((ex) => ex.name === 'messageType')[0]
    if (fieldEE) {
      updateModdleProps(modeling, element, fieldEE, { string: messageType.value?.join(',') })
    } else {
      addExtensionElements(
        bpmnModeler,
        element,
        element!.businessObject,
        createExElement(bpmnModeler, 'Field', {
          name: 'messageType',
          string: messageType.value?.join(',')
        })
      )
    }
  }

  const updateTransferToUserNos = debounce(
    { delay: 0, trailing: true },
    (transferToUserNos: string) => {
      idmCandidateUsers.value = []
      updateCopyUserNos(transferToUserNos)
    }
  )

  const initElementState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    const FieldExtensionElements = getExExtensionElementsList(bo, 'Field')
    for (const exEl of FieldExtensionElements) {
      switch (exEl.name) {
        case 'transferToUserNos':
          transferToUserNos.value = exEl.get('string')
          break
        case 'messageType':
          messageType.value = exEl.get('string')?.split(',')
          break
      }
    }

    const UserExtensionElement = getExExtensionElementsList(bo, 'IdmCandidateUsers')?.[0]
    if (UserExtensionElement) {
      idmCandidateUsers.value = JSON.parse(UserExtensionElement.get('body') || '[]')
    }
  }

  const resetFormState = () => {
    transferToUserNos.value = undefined
    idmCandidateUsers.value = messageType.value = []
  }

  onMounted(() => getPlatformMessageType())
  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="CopyServiceTask">
    <template #header>
      <BpmnIcon name="copy-service-task" />
      {{ $t('CopyServiceTask') }}
    </template>
    <edit-item
      v-if="platformData && platformSuccess"
      :label="$t('CopyMessage')"
      :label-width="labelWidth"
    >
      <a-checkbox-group
        v-model="messageType"
        :options="messageTypeOps"
        @change="updateMessageType"
      />
    </edit-item>
    <edit-item key="CopyUsers" :label-width="labelWidth" :label="$t('CopyUser')">
      <UserTagInput v-model:data="idmCandidateUsers" @change="updateCopyUserNos()">
        <a-input v-model="transferToUserNos" @input="updateTransferToUserNos" />
      </UserTagInput>
    </edit-item>
  </a-collapse-item>
</template>
