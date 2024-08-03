<script setup lang="ts">
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'
  import {
    createField,
    createListener,
    getDefaultImplementationProperties,
    getListenerEventTypeOptions,
    getListenersContainer,
    getListenerTypeOptions,
    initListenerTableData,
    Listener,
    ListenerImplementationType
  } from '@/helpers/listener-helpers'
  import {
    addExtensionElements,
    getExExtensionElementsList,
    removeExtensionElements
  } from '@/utils/extension-elements-utils'
  import type { TableColumnData } from '@arco-design/web-vue'
  import { updateModdleProps } from '@/utils/modeling'

  defineOptions({ name: 'TaskListener' })

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  let scopedElement: BpmnElement | undefined = undefined
  let scopedBO: BpmnModdleEl | undefined = undefined
  let scopedListenerList: BpmnModdleEl[] | undefined = undefined

  const listenerColumns: TableColumnData[] = [
    {
      title: t('EventType'),
      width: 100,
      ellipsis: true,
      tooltip: true,
      dataIndex: 'event',
      render: ({ record }) => (record.event ? t(record.event) : '-')
    },
    {
      title: t('ListenerType'),
      ellipsis: true,
      tooltip: true,
      dataIndex: 'listenerType',
      render: ({ record }) => (record.listenerType ? t(record.listenerType) : '-')
    },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const listenerList = shallowRef<Listener[]>([])
  const listenerEventTypeOptions = shallowRef<PropertyOptions>([])
  const listenerTypeOptions = shallowRef<PropertyOptions>([])

  let activeListenerIns: BpmnModdleEl | undefined = undefined
  let activeListenerIdx = ref<number>(-1)
  const modalListenerForm = ref<Listener | undefined>()
  const modalVisible = ref(false)

  // 移除
  const removeListener = (idx: number) => {
    const listener = scopedListenerList![idx]
    removeExtensionElements(modeler!.value!, scopedElement!, scopedBO!, listener)
  }
  // 打开编辑弹窗
  const openListenerFormModal = (row?: Listener, idx?: number) => {
    modalListenerForm.value = row
    if (idx !== undefined) {
      activeListenerIdx.value = idx
      activeListenerIns = scopedListenerList![idx]
    } else {
      activeListenerIdx.value = -1
      activeListenerIns = null
    }
    modalVisible.value = true
  }
  // 创建或者更新监听器
  const submitListener = async (listener: Listener) => {
    if (activeListenerIdx.value > -1) {
      updateElementListener(listener)
    } else {
      createElementListener(listener)
    }
    return true
  }
  const updateElementListener = (listener: Listener) => {
    updateModdleProps(modeler!.value!.get('modeling'), scopedElement, activeListenerIns, {
      ...getDefaultImplementationProperties(
        modeler!.value!,
        listener.listenerType as ListenerImplementationType,
        listener.listenerContent
      ),
      event: listener.event,
      fields: listener.fields.map((f) => createField(modeler!.value!, f, activeListenerIns))
    })
  }
  const createElementListener = (listener: Listener) => {
    const bpmnListener = createListener(modeler!.value!, listener, 'TaskListener')
    addExtensionElements(modeler!.value!, scopedElement, scopedBO, bpmnListener)
  }

  useElementUpdateListener(() => {
    scopedElement = currentElement?.value
    if (!scopedElement) {
      listenerList.value = []
      scopedListenerList = scopedBO = undefined
      return
    }
    scopedBO = getListenersContainer(scopedElement)
    listenerEventTypeOptions.value = getListenerEventTypeOptions('TaskListener')
    listenerTypeOptions.value = getListenerTypeOptions()
    scopedListenerList = getExExtensionElementsList(scopedBO, 'TaskListener')

    listenerList.value = initListenerTableData(scopedListenerList)
  })
</script>

<template>
  <a-collapse-item key="TaskListener">
    <template #header>
      <LucideIcon name="BellPlus" />{{ $t('TaskListener') }}
      <a-tag color="blue">{{ listenerList.length }}</a-tag>
    </template>

    <a-table
      :columns="listenerColumns"
      :data="listenerList"
      :scroll="{ y: 240 }"
      :pagination="false"
    >
      <template #operation="{ record, rowIndex }">
        <a-button type="text" @click="openListenerFormModal(record, rowIndex)">{{
          $t('Edit')
        }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeListener(rowIndex)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-button type="primary" class="inline-large-button" long @click="openListenerFormModal()">
      <icon-plus />
      {{ $t('AddListener') }}
    </a-button>

    <ListenerForm
      v-model:visible="modalVisible"
      v-model:form="modalListenerForm"
      listener-type="taskListener"
      :title="$t('TaskListener')"
      :event-type-options="listenerEventTypeOptions"
      :listener-type-options="listenerTypeOptions"
      :confirm="submitListener"
    />
  </a-collapse-item>
</template>
