<script setup lang="ts">
  import type { FormInstance, TableColumnData } from '@arco-design/web-vue'
  import type { NextUser, NextFlow } from '@/components/Panel/common/types'
  import type { ModdleElement } from 'bpmn-js/lib/model/Types'
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'
  import { commonValidatorRules } from '@/utils/bpmn-validators'
  import {
    addExtensionElements,
    getExExtensionElementsList,
    removeExtensionElements
  } from '@/utils/extension-elements-utils'
  import { updateModdleProp } from '@/utils/modeling'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { createExElement } from '@/utils/element-utils'

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  type ModalType = 'NextUser' | 'NextFlow'

  const modalVisible = ref(false)
  const modalTitle = ref('')
  const modalType = ref<ModalType>('NextUser')
  const modalActiveFlag = ref<number>(0) // -1: 新增; > -1: 编辑
  const modalForm = ref<NextUser>({})
  const modalFormRef = shallowRef<FormInstance | null>(null)
  const modalNameRules = commonValidatorRules(t('NameCanNotBeEmpty'))
  const modalCodeRules = commonValidatorRules(t('CodeCanNotBeEmpty'))
  const modalTitleMap = {
    create: {
      NextUser: 'CreateNewNextUser',
      NextFlow: 'CreateNewNextFlow'
    },
    edit: {
      NextUser: 'EditNewNextUser',
      NextFlow: 'EditNewNextFlow'
    }
  }

  const nextUserColumns: TableColumnData[] = [
    { title: t('Name'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('Code'), ellipsis: true, tooltip: true, dataIndex: 'code' },
    {
      title: t('IsMultiple'),
      ellipsis: true,
      tooltip: true,
      dataIndex: 'multiple',
      render: ({ record }) => (record.multiple ? '是' : '否')
    },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const nextUserList = ref<NextUser[]>([])

  const nextFlowColumns: TableColumnData[] = [
    { title: t('Name'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('Code'), ellipsis: true, tooltip: true, dataIndex: 'code' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const nextFlowList = ref<NextFlow[]>([])

  const computedNextConfigLength = computed(() => {
    return nextUserList.value.length + nextFlowList.value.length
  })

  const addElementModal = (type: ModalType) => {
    modalActiveFlag.value = -1
    modalType.value = type
    modalTitle.value = t(modalTitleMap.create[type])
    modalForm.value = {}

    modalVisible.value = true
  }
  const editElementModal = (type: ModalType, row: NextUser | NextFlow, idx: number) => {
    modalActiveFlag.value = idx
    modalType.value = type
    modalTitle.value = t(modalTitleMap.edit[type])
    modalForm.value = { ...row }
    modalVisible.value = true
  }
  const removeElement = (type: ModalType, idx: number) => {
    if (type === 'NextUser') {
      nextUserList.value.splice(idx, 1)
    } else {
      nextFlowList.value.splice(idx, 1)
    }
    updateNextConfigExtensions(type)
  }

  const submitElement = () => {
    modalFormRef.value?.validate().then((errors) => {
      if (errors) return errors
      modalActiveFlag.value > 0 ? submitUpdateElement() : submitNewElement()
      modalVisible.value = false
    })
  }
  const submitUpdateElement = () => {
    if (modalType.value === 'NextUser') {
      nextUserList.value.splice(modalActiveFlag.value, 1, { ...modalForm.value })
    } else {
      nextFlowList.value.splice(modalActiveFlag.value, 1, { ...modalForm.value })
    }
    updateNextConfigExtensions(modalType.value)
  }
  const submitNewElement = () => {
    if (modalType.value === 'NextUser') {
      nextUserList.value.push({ ...modalForm.value })
    } else {
      nextFlowList.value.push({ ...modalForm.value })
    }
    updateNextConfigExtensions(modalType.value)
  }

  const updateNextConfigExtensions = (modalType: ModalType) => {
    const element = currentElement?.value
    const BO = element?.businessObject
    if (!BO) return

    const type = modalType === 'NextUser' ? 'NextUser' : 'NextSequenceFlow'
    const value = modalType === 'NextUser' ? nextUserList.value : nextFlowList.value
    const body = value?.length ? JSON.stringify(value) : undefined

    const modeling = modeler!.value!.get<Modeling>('modeling')
    let nextEl = getExExtensionElementsList(BO, type)?.[0]
    if (nextEl) {
      body
        ? updateModdleProp(modeling, element, nextEl, 'body', body)
        : removeExtensionElements(modeler!.value!, element, BO, nextEl)
      return
    }
    if (!body) return
    nextEl = createExElement(modeler!.value!, type, { body })
    addExtensionElements(modeler!.value!, element, BO, nextEl)
  }

  const initElementState = () => {
    nextUserList.value = []
    nextFlowList.value = []
    const element = currentElement?.value
    const BO = element?.businessObject
    if (!BO) return
    const nextUserElement = getExExtensionElementsList(BO, 'NextUser')?.[0]
    const nextFlowElement = getExExtensionElementsList(BO, 'NextSequenceFlow')?.[0]
    if (nextUserElement) {
      nextUserList.value = JSON.parse(nextUserElement.get('body') || '[]')
    }
    if (nextFlowElement) {
      nextFlowList.value = JSON.parse(nextFlowElement.get('body') || '[]')
    }
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="UserTaskFreeApproval">
    <template #header>
      <LucideIcon name="Wrench" />{{ $t('UserTaskFreeApproval') }}
      <a-tag color="blue">{{ computedNextConfigLength }}</a-tag>
    </template>

    <div class="panel-table-header">
      <LucideIcon name="UserRound" />
      <span class="table-header_text">{{ $t('NextUserList') }}</span>
      <a-button type="primary" @click="addElementModal('NextUser')">
        <icon-plus />
        {{ $t('CreateNewNextUser') }}
      </a-button>
    </div>
    <a-table
      :columns="nextUserColumns"
      :data="nextUserList"
      :scroll="{ y: 240 }"
      :pagination="false"
    >
      <template #operation="{ record, rowIndex }">
        <a-button type="text" @click="editElementModal('NextUser', record, rowIndex)">{{
          $t('Edit')
        }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeElement('NextUser', rowIndex)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-divider type="dashed" margin="12px" />

    <div class="panel-table-header">
      <LucideIcon name="MoveUpRight" />
      <span class="table-header_text">{{ $t('NextFlowList') }}</span>
      <a-button type="primary" @click="addElementModal('NextFlow')">
        <icon-plus />
        {{ $t('CreateNewNextFlow') }}
      </a-button>
    </div>
    <a-table
      :columns="nextFlowColumns"
      :data="nextFlowList"
      :scroll="{ y: 240 }"
      :pagination="false"
    >
      <template #operation="{ record, rowIndex }">
        <a-button type="text" @click="editElementModal('NextFlow', record, rowIndex)">{{
          $t('Edit')
        }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeElement('NextFlow', rowIndex)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-drawer v-model:visible="modalVisible" :width="480" :title="modalTitle">
      <a-form ref="modalFormRef" :model="modalForm" :label-col="{ span: 4 }" label-align="right">
        <a-form-item :label="$t('Name')" field="name" :="modalNameRules">
          <a-input v-model:model-value="modalForm.name" placeholder="请输入名称"/>
        </a-form-item>
        <a-form-item :label="$t('Code')" field="code" :="modalCodeRules">
          <a-input v-model:model-value="modalForm.code" placeholder="请输入编码"/>
        </a-form-item>
        <a-form-item v-if="modalType === 'NextUser'" :label="$t('IsMultiple')" field="multiple">
          <a-switch v-model:model-value="modalForm.multiple" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="modalVisible = false">{{ $t('Cancel') }}</a-button>
        <a-button type="primary" @click="submitElement">{{ $t('Confirm') }}</a-button>
      </template>
    </a-drawer>
  </a-collapse-item>
</template>
