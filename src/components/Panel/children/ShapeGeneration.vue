<script lang="ts" setup>
  import { ref } from 'vue'
  import {
    getCandidateStarterGroups,
    getCandidateStarterUsers,
    getProcessExecutable,
    setCandidateStarterGroups,
    setCandidateStarterUsers,
    setNameValue,
    setProcessExecutable
  } from '@/helpers/genner-properties'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import { InitRef } from '@/components/Panel/common/types'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { isEmptyStartEvent } from '@/utils/element-supported'
  import {
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { resetAssigneeType, setExtensionItem, setBoProperty } from '@/helpers/user-task-helpers'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import { createExElement } from '@/utils/element-utils'
  import { saveProcessNameExp } from '@/api/bpmn'
  import { debounce } from '@/utils/debounce'

  defineOptions({ name: 'ShapeGeneration' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const isCollaboration = ref(false)
  const isProcessFormVisible = ref(false)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    let businessObject = element.businessObject

    // 存在泳池时，默认 "Collaboration" 节点替换为 "Process" 节点
    if (is(element, 'bpmn:Collaboration')) {
      isCollaboration.value = true
      isProcessFormVisible.value = true
      businessObject = element.children[0].businessObject.processRef
    } else {
      isProcessFormVisible.value = is(element, 'bpmn:Process')
      isCollaboration.value = false
    }

    const modeling = modeler!.value!.get<Modeling>('modeling')
    return { element, businessObject, modeling }
  }

  const elementId = ref<string>('')
  const elementName = ref<string>('')
  const updateElementName = debounce({ delay: 0, trailing: true }, () => {
    const { element, businessObject } = getElementAndModeling()
    setNameValue(modeler!.value!, element, businessObject, elementName.value)
  })

  // 直接设置提交人
  const showStarterBtn = ref(false)
  const setStarterInfo = () => {
    showStarterBtn.value = is(currentElement!.value!, 'bpmn:UserTask')
  }
  const toggleTaskToStarter = () => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProps(modeling, element, element.businessObject, {
      skipExpression: `\${initiator == ''}`,
      name: '提交人',
      assignee: '${initiator}'
    })
    const commands: Array<CommandContext | undefined> = [
      {
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: element.businessObject,
          properties: {
            skipExpression: `\${initiator == ''}`,
            name: '提交人',
            assignee: '${initiator}'
          }
        }
      },
      ...resetAssigneeType(modeler!.value!, element, 'static')
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }

  // 流程可执行状态，启动人、启动组
  const processExecute = ref<boolean>(false)
  const processStarterGroups = ref<string>('')
  const processStarterUsers = ref<string>('')
  const idmCandidateUsers = ref<InitRef<any[]>>()
  const idmCandidateGroups = ref<InitRef<any[]>>()
  const processNameExp = ref<InitRef<string>>()

  const setExternalInfo = () => {
    const { businessObject: bo } = getElementAndModeling()
    processExecute.value = getProcessExecutable(bo)

    const processNameExpEl = getExExtensionElementsList(bo, 'ProcessNameExp')?.[0]
    processNameExp.value = processNameExpEl?.get('body')

    const idmCandidateUsersEl = getExExtensionElementsList(bo, 'IdmCandidateUsers')?.[0]
    const idmCandidateGroupsEl = getExExtensionElementsList(bo, 'IdmCandidateGroups')?.[0]
    idmCandidateUsers.value = JSON.parse(idmCandidateUsersEl?.get('body') || '[]')
    idmCandidateGroups.value = JSON.parse(idmCandidateGroupsEl?.get('body') || '[]')
    processStarterGroups.value = getCandidateStarterGroups(bo)
    processStarterUsers.value = getCandidateStarterUsers(bo)
  }
  const updateProcessExecutable = (value) => {
    const { element, businessObject } = getElementAndModeling()
    setProcessExecutable(modeler!.value!, element, businessObject, value)
  }
  const updateIdmCandidateUsers = () => {
    const element = currentElement!.value
    const users = idmCandidateUsers.value!
    const idmUsers = JSON.stringify(users)
    const idmUserStr = users.map((i) => i.code).toString()
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'candidateStarterGroups', idmUserStr),
      setExtensionItem(modeler!.value!, element, 'IdmCandidateUsers', idmUsers)
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const updateIdmCandidateGroups = () => {
    const element = currentElement!.value
    const groups = idmCandidateGroups.value!
    const idmGroups = JSON.stringify(groups)
    const idmGroupsStr = groups.map((i) => i.sn).toString()
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'candidateStarterUsers', idmGroupsStr),
      setExtensionItem(modeler!.value!, element, 'IdmCandidateGroups', idmGroups)
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const updateStarterGroups = () => {
    const { element, businessObject } = getElementAndModeling()
    setCandidateStarterGroups(modeler!.value!, element, businessObject, processStarterGroups.value)
  }
  const updateStarterUsers = () => {
    const { element, businessObject } = getElementAndModeling()
    setCandidateStarterUsers(modeler!.value!, element, businessObject, processStarterUsers.value)
  }
  const updateProcessNameExp = (value) => {
    const { element, businessObject, modeling } = getElementAndModeling()

    const processNameExpEl = getExExtensionElementsList(businessObject, 'ProcessNameExp')?.[0]
    if (processNameExpEl) {
      updateModdleProp(modeling, element, processNameExpEl, 'body', value)
    } else {
      const commands = generateAddExtensionCommand(
        modeler!.value!,
        element,
        element.businessObject,
        createExElement(modeler!.value!, 'ProcessNameExp', { body: value })
      )
      execPanelMultiCommands(modeler!.value!, commands)
    }
  }
  const saveProcessExp = async (processNameExp) => {
    try {
      const { businessObject } = getElementAndModeling()
      const modelKey = businessObject.id
      // @ts-expect-error
      const { success } = await saveProcessNameExp({ processNameExp, modelKey })
      return success as boolean
    } catch (e) {
      return false
    }
  }

  // 异步延续
  const asyncValue = ref<InitRef<boolean>>()
  const asyncVisible = ref<InitRef<boolean>>()
  const setAsyncVisible = (element: BpmnElement) => {
    if (is(element, 'bpmn:Activity') && !is(element, 'bpmn:SubProcess')) {
      asyncVisible.value = true
      asyncValue.value = element.businessObject.get('async')
    } else {
      asyncVisible.value = false
    }
  }
  const updateAsync = (value: boolean) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, 'async', value)
  }

  // 发起人
  const initiatorVisible = ref<InitRef<boolean>>()
  const initiator = ref<InitRef<string>>()
  const setInitiatorVisible = (element: BpmnElement) => {
    if (is(element, 'bpmn:StartEvent') && isEmptyStartEvent(element)) {
      initiatorVisible.value = true
      initiator.value = element.businessObject.get('initiator')
    } else {
      initiatorVisible.value = false
    }
  }
  const updateInitiator = debounce({ delay: 0, trailing: true }, (value: boolean) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, 'initiator', value)
  })

  // 跳过表达式
  const skipExpressionVisible = ref<InitRef<boolean>>()
  const skipExpression = ref<InitRef<string>>()
  const setSkipExpressionVisible = (element: BpmnElement) => {
    if (is(element, 'bpmn:UserTask')) {
      skipExpressionVisible.value = true
      skipExpression.value = element.businessObject.get('skipExpression')
    } else {
      skipExpressionVisible.value = false
    }
  }
  const updateSkipExpression = debounce({ delay: 0, trailing: true }, (value: boolean) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, 'skipExpression', value)
  })

  const initFormState = () => {
    const { businessObject } = getElementAndModeling()
    elementId.value = businessObject.id
    elementName.value = businessObject.name
  }

  useElementUpdateListener(() => {
    initFormState()

    if (isProcessFormVisible.value) {
      setExternalInfo()
    }

    setStarterInfo()
    setAsyncVisible(currentElement!.value)
    setInitiatorVisible(currentElement!.value)
    setSkipExpressionVisible(currentElement!.value)
  })
</script>

<template>
  <a-collapse-item key="ShapeGeneration">
    <template #header><lucide-icon name="Box" />{{ $t('ShapeGeneration') }}</template>

    <!--  基础 名称与id  -->
    <edit-item :label="$t('Id')">
      <a-input v-model="elementId" :maxlength="32" disabled />
    </edit-item>
    <edit-item :label="$t('Name')">
      <a-input
        v-model:model-value="elementName"
        :maxlength="32"
        placeholder="请输入名称"
        :disabled="isProcessFormVisible"
        clearable
        @input="updateElementName"
      />
      <template #description>
        <a-button v-if="showStarterBtn" size="mini" type="primary" @click="toggleTaskToStarter"
          >设为提交人</a-button
        >
      </template>
    </edit-item>

    <!--  流程名称  -->
    <edit-item v-if="isProcessFormVisible" :label="$t('CustomTitle')">
      <VariableTitleInput
        v-model:value="processNameExp"
        :process-id="elementId"
        :confirm="saveProcessExp"
        @change="updateProcessNameExp"
      />
    </edit-item>

    <!--  流程扩展属性  -->
    <edit-item v-if="isProcessFormVisible" :label="$t('Executable')">
      <a-switch v-model="processExecute" @change="updateProcessExecutable" />
    </edit-item>
    <edit-item v-if="isProcessFormVisible" :label="$t('ProcessStarterUsers')">
      <UserTagInput v-model:data="idmCandidateUsers" @change="updateIdmCandidateUsers" />
    </edit-item>
    <edit-item v-if="isProcessFormVisible" :label="$t('ProcessStarterGroups')">
      <RoleTagInput v-model:data="idmCandidateGroups" @change="updateIdmCandidateGroups" />
    </edit-item>

    <!--  特殊内容  -->
    <edit-item v-if="asyncVisible" :label="$t('AsyncContinuation')">
      <a-switch v-model="asyncValue" @change="updateAsync" />
    </edit-item>
    <edit-item v-if="initiatorVisible" :label="$t('Starter')">
      <a-input v-model="initiator" @input="updateInitiator" />
    </edit-item>
    <edit-item v-if="skipExpressionVisible" :label="$t('SkipExpression')">
      <a-input v-model="skipExpression" @input="updateSkipExpression" />
    </edit-item>
  </a-collapse-item>
</template>
