<script setup lang="ts">
  import type { AssigneeType, IdmAssigneeType, InitRef } from '@/components/Panel/common/types'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'
  import { getPropValue } from '@/utils/modeling'
  import { getExExtensionElementsList } from '@/utils/extension-elements-utils'
  import { Modal } from '@arco-design/web-vue'
  import {
    resetAssigneeType,
    removeIdmAssignee,
    removeIdmCandidate,
    removeStaticContext,
    setExtensionItem,
    setBoProperty
  } from '@/helpers/user-task-helpers'
  import { execPanelCommands, execPanelMultiCommands } from '@/utils/commandsExecute'
  import { debounce } from '@/utils/debounce'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { is } from 'bpmn-js/lib/util/ModelUtil'

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const labelWidth = 96

  const processId = ref<string | undefined>()
  const dueDate = ref<string | undefined>()
  const priority = ref<number | undefined>()

  // 属性更新工具函数
  const updateShapeProperty = debounce(
    { delay: 0, trailing: true },
    (key: string, value: unknown) => {
      const element = currentElement!.value
      const command = setBoProperty(element, key, value)
      execPanelCommands(modeler!.value!, command.context)
    }
  )

  const updateShapePriority = () => {
    updateShapeProperty('priority', priority.value)
  }
  const updateDueDate = () => {
    updateShapeProperty('dueDate', dueDate.value)
  }

  // 原始支持属性
  const assignee = ref<InitRef<string>>()
  const candidateUsers = ref<InitRef<string>>()
  const candidateGroups = ref<InitRef<string>>()
  // 属性控制标识
  const assigneeType = ref<AssigneeType>('static')
  const assigneeTypeBack = ref<AssigneeType>('static') // tab 切换备份
  // 扩展控制属性类型
  const idmAssigneeType = ref<InitRef<IdmAssigneeType>>('candidate')
  // 静态数据
  const staticAssigneeVariables = ref<InitRef<any[]>>()
  // 扩展控制属性 1, 指定人
  // 扩展控制属性 2, 候选人
  const idmAssignee = ref<InitRef<any[]>>()
  const idmCandidateUsers = ref<InitRef<any[]>>()
  const idmCandidateGroups = ref<InitRef<any[]>>()

  const updateShapeAssignee = (assignee, variables) => {
    const element = currentElement!.value
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'assignee', assignee || undefined),
      setExtensionItem(
        modeler!.value!,
        element,
        'StaticAssigneeVariables',
        JSON.stringify(variables)
      )
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const updateShapeAssigneeData = (data: any[]) => {
    const assignee = data.map((i) => i.value).toString()
    const variables = data.map(({ name, tabKey, value }) => ({ name, tabKey, value }))
    updateShapeAssignee(assignee, variables)
  }
  const updateShapeAssigneeValue = (value: string) => {
    updateShapeAssignee(value, [])
  }

  const updateCandidateUsers = () => {
    updateShapeProperty('candidateUsers', candidateUsers.value)
  }
  const updateCandidateGroups = () => {
    updateShapeProperty('candidateGroups', candidateGroups.value)
  }
  const updateIdmAssignee = () => {
    const element = currentElement!.value
    const idmAss = JSON.stringify(idmAssignee.value!)
    const ass = idmAssignee.value!.map((i) => i.code).join(',')
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'assignee', ass),
      setExtensionItem(modeler!.value!, element, 'IdmAssignee', idmAss)
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }
  const updateIdmCandidateUsers = () => {
    const element = currentElement!.value
    const users = idmCandidateUsers.value!
    const idmUsers = JSON.stringify(users)
    const idmUserStr = users.map((i) => i.code).toString()
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'candidateUsers', idmUserStr),
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
      setBoProperty(element, 'candidateGroups', idmGroupsStr),
      setExtensionItem(modeler!.value!, element, 'IdmCandidateGroups', idmGroups)
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }

  // 切换 tab，重置节点数据
  const validateModalNeeding = () => {
    return assignee.value || candidateUsers.value || candidateGroups.value
  }
  const changeAssigneeType = () => {
    const element = currentElement!.value
    assigneeTypeBack.value = assigneeType.value
    const commands: Array<CommandContext | undefined> = [removeStaticContext(element)]
    if (assigneeType.value === 'static') {
      commands.push(removeIdmAssignee(element))
      commands.push(removeIdmCandidate(element))
      commands.push(...resetAssigneeType(modeler!.value!, element, 'static'))
    } else {
      commands.push(...resetAssigneeType(modeler!.value!, element, 'idm'))
    }
    execPanelMultiCommands(modeler!.value!, commands)
  }
  const changeActiveTab = () => {
    if (assigneeTypeBack.value === assigneeType.value) return
    const valid = validateModalNeeding()
    if (valid) {
      Modal.warning({
        title: t('WarningMessage'),
        hideCancel: false,
        content: t('ThisOperationWillClearTheSelectedData,DoYouWantToContinue?'),
        onOk: () => changeAssigneeType(),
        onCancel() {
          assigneeType.value = assigneeTypeBack.value
        },
        onClose() {
          assigneeType.value = assigneeTypeBack.value
        }
      })
    } else {
      changeAssigneeType()
    }
  }
  // 切换 Idm 指定类型
  // const updateIdmAssigneeType = (type: IdmAssigneeType) => {
  //   const element = currentElement!.value
  //   // 1. 转为发起人，清除其他 idm 属性
  //   if (type === 'starter') {
  //     const commands: Array<CommandContext | undefined> = [
  //       // removeStaticContext(element),
  //       // removeIdmCandidate(element),
  //       // removeIdmAssignee(element),
  //       setBoProperty(element, 'assignee', '${starterCode}')
  //     ]
  //     return execPanelMultiCommands(modeler!.value!, commands)
  //   }
  //   // 2. 转为候选人，清除 idmAssignee 与公共属性
  //   if (type === 'candidate') {
  //     const commands: Array<CommandContext | undefined> = [
  //       // removeStaticContext(element),
  //       setBoProperty(element, 'candidateUsers', ''),
  //       setBoProperty(element, 'candidateGroups', ''),
  //       setExtensionItem(modeler!.value!, element, 'IdmCandidateUsers'),
  //       setExtensionItem(modeler!.value!, element, 'IdmCandidateGroups')
  //       // removeIdmAssignee(element)
  //     ]
  //     return execPanelMultiCommands(modeler!.value!, commands)
  //   }
  //   // 3. 转为指定人，清除 idm 候选属性与公共属性
  //   const commands: Array<CommandContext | undefined> = [
  //     // removeStaticContext(element),
  //     setBoProperty(element, 'assignee'),
  //     setExtensionItem(modeler!.value!, element, 'IdmAssignee')
  //     // removeIdmCandidate(element)
  //   ]
  //   return execPanelMultiCommands(modeler!.value!, commands)
  // }

  // 切换 Idm 指定类型
  const updateIdmAssigneeType = (type: IdmAssigneeType) => {
    const element = currentElement!.value
    // 1. 转为发起人，清除其他 idm 属性
    if (type === 'starter') {
      const commands: Array<CommandContext | undefined> = [
        setBoProperty(element, 'assignee', '${starterCode}')
      ]
      return execPanelMultiCommands(modeler!.value!, commands)
    }
    // 2. 转为指定人
    const ass = idmAssignee.value?.map((i) => i.code).join(',')
    const commands: Array<CommandContext | undefined> = [
      setBoProperty(element, 'assignee', ass)
      // setExtensionItem(modeler!.value!, element, 'IdmAssignee')
    ]
    return execPanelMultiCommands(modeler!.value!, commands)
  }

  // 数据初始化
  const initElementState = () => {
    resetUserTaskState()
    const element = currentElement!.value!
    const BO = element.businessObject
    if (!BO) return
    dueDate.value = getPropValue(BO, 'dueDate')
    priority.value = getPropValue(BO, 'priority')

    const root = modeler!.value!.get<Canvas>('canvas').getRootElement()
    if (is(root, 'bpmn:Collaboration')) {
      processId.value = root.children[0].businessObject.processRef.id
    } else {
      processId.value = root['id']
    }

    const extensionElements = getExExtensionElementsList(BO, 'AssigneeType')
    assigneeType.value = extensionElements?.[0]?.get('body') || 'static'
    assigneeTypeBack.value = assigneeType.value
    // 静态指定
    // if (assigneeType.value === 'static') {
    //   assignee.value = getPropValue(BO, 'assignee')
    //   candidateUsers.value = getPropValue(BO, 'candidateUsers')
    //   candidateGroups.value = getPropValue(BO, 'candidateGroups')
    // }
    assignee.value = getPropValue(BO, 'assignee')
    candidateUsers.value = getPropValue(BO, 'candidateUsers')
    candidateGroups.value = getPropValue(BO, 'candidateGroups')
    // 指定人变量
    const staticAssigneeEl = getExExtensionElementsList(BO, 'StaticAssigneeVariables')?.[0]
    if (staticAssigneeEl) {
      staticAssigneeVariables.value = JSON.parse(staticAssigneeEl.get('body') || '[]')
    }
    // 动态指定
    // 1.指定单人
    const idmAssigneeEl = getExExtensionElementsList(BO, 'IdmAssignee')?.[0]
    if (idmAssigneeEl) {
      // idmAssigneeType.value = 'specify'
      idmAssignee.value = JSON.parse(idmAssigneeEl.get('body') || '[]')
    }
    // 2.候选人
    const idmCandidateUsersEl = getExExtensionElementsList(BO, 'IdmCandidateUsers')?.[0]
    const idmCandidateGroupsEl = getExExtensionElementsList(BO, 'IdmCandidateGroups')?.[0]
    if (idmCandidateUsersEl || idmCandidateGroupsEl) {
      // idmAssigneeType.value = 'candidate'
      idmCandidateUsers.value = JSON.parse(idmCandidateUsersEl?.get('body') || '[]')
      idmCandidateGroups.value = JSON.parse(idmCandidateGroupsEl?.get('body') || '[]')
    }
    // 3.默认发起人
    idmAssigneeType.value = assignee.value === '${starterCode}' ? 'starter' : 'specify'
  }
  // 重置显示状态
  const resetUserTaskState = () => {
    idmAssigneeType.value = undefined
    dueDate.value = priority.value = staticAssigneeVariables.value = undefined
    assignee.value = candidateUsers.value = candidateGroups.value = undefined
    idmAssignee.value = idmCandidateUsers.value = idmCandidateGroups.value = undefined
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="UserTask">
    <template #header><LucideIcon name="UserRound" />{{ $t('UserTask') }}</template>
    <a-tabs
      v-model:active-key="assigneeType"
      position="left"
      style="margin: 12px 0"
      @tab-click="changeActiveTab"
    >
      <a-tab-pane key="static" :title="$t('StaticValue')">
        <edit-item label-width="min" :label="$t('AssigneeUsers')">
          <StaticUserTagInput
            v-model:data="staticAssigneeVariables"
            v-model:value="assignee"
            :process-id="processId"
            :multiple="false"
            @change-data="updateShapeAssigneeData"
            @change-value="updateShapeAssigneeValue"
          />
        </edit-item>
        <edit-item label-width="min" :label="$t('CandidateUsers')">
          <StringTags
            v-model:value="candidateUsers"
            :btn-text="$t('Add')"
            @change="updateCandidateUsers"
          />
        </edit-item>
        <edit-item label-width="min" :label="$t('CandidateGroups')">
          <StringTags
            v-model:value="candidateGroups"
            :btn-text="$t('Add')"
            @change="updateCandidateGroups"
          />
        </edit-item>
      </a-tab-pane>

      <a-tab-pane key="idm" :title="$t('IdentityStorage')">
        <edit-item label-width="min" :label="$t('SpecifyAssignee')">
          <a-radio-group v-model="idmAssigneeType" type="button" @change="updateIdmAssigneeType">
            <a-radio value="specify">{{ $t('Specify') }}</a-radio>
            <!--            <a-radio value="candidate">{{ $t('Candidate') }}</a-radio>-->
            <a-radio value="starter">{{ $t('Starter') }}</a-radio>
          </a-radio-group>
        </edit-item>

        <edit-item
          v-if="idmAssigneeType === 'specify'"
          key="IdmAssignee"
          label-width="min"
          :label="$t('AssigneeUsers')"
        >
          <UserTagInput
            key="idmAssignee"
            v-model:data="idmAssignee"
            :multiple="false"
            @change="updateIdmAssignee"
          />
        </edit-item>
        <edit-item key="AssigneeUsers" label-width="min" :label="$t('CandidateUsers')">
          <UserTagInput
            key="idmCandidateUsers"
            v-model:data="idmCandidateUsers"
            @change="updateIdmCandidateUsers"
          />
        </edit-item>
        <edit-item key="AssigneeGroups" label-width="min" :label="$t('CandidateGroups')">
          <RoleTagInput
            key="idmCandidateGroups"
            v-model:data="idmCandidateGroups"
            @change="updateIdmCandidateGroups"
          />
        </edit-item>
      </a-tab-pane>
    </a-tabs>

    <edit-item :label-width="labelWidth" :label="$t('DueDate')">
      <ExpirationTimeInput v-model:value="dueDate" :title="$t('DueDate')" @change="updateDueDate" />
    </edit-item>
    <edit-item :label-width="labelWidth" :label="$t('Priority')">
      <a-input-number
        v-model="priority"
        placeholder="请输入优先级"
        allow-clear
        @change="updateShapePriority"
      />
    </edit-item>
  </a-collapse-item>
</template>
