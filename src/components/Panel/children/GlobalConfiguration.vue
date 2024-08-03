<script setup lang="ts">
  import type { ModdleElement } from 'bpmn-js/lib/model/Types'
  import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import { useI18n } from 'vue-i18n'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { createElement, getRoot, nextId } from '@/utils/element-utils'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { commonValidatorRules, idValidator, isIdValid } from '@/utils/bpmn-validators'
  import { FormInstance, Message } from '@arco-design/web-vue'
  import { updateStorage } from '@/components/Panel/common/utils'
  import { sleep } from 'radash'

  defineOptions({ name: 'GlobalConfiguration' })
  const { t } = useI18n()

  type GlobalShape = {
    id: string
    name?: string
    scope?: string
  }
  type ModalType = 'Message' | 'Error' | 'Signal'

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  let root: BpmnRoot | undefined

  // 消息
  const messageColumns = [
    { title: t('Id'), ellipsis: true, tooltip: true, dataIndex: 'id' },
    { title: t('Name'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const messageList = ref<GlobalShape[]>([])

  // 错误
  const errorColumns = [
    { title: t('Id'), ellipsis: true, tooltip: true, dataIndex: 'id' },
    { title: t('Name'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const errorList = ref<GlobalShape[]>([])

  // 信号
  const signalColumns = [
    { title: t('Id'), ellipsis: true, tooltip: true, dataIndex: 'id' },
    { title: t('Name'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const signalList = ref<GlobalShape[]>([])

  const totalConfigNums = computed(() => {
    return signalList.value.length + errorList.value.length + messageList.value.length
  })

  const modalVisible = ref(false)
  const modalTitle = ref('')
  const modalType = ref<ModalType>('Message')
  const modalForm = ref<GlobalShape>({ id: '', name: '', scope: '' })
  const modalFlag = ref<number>(0) // 0 新增；1 编辑
  let activeElement: ModdleElement | null = null

  const modalFormRef = shallowRef<FormInstance | null>(null)
  const modalIdRules = commonValidatorRules(t('Id'), idValidator)
  const modalNameRules = commonValidatorRules(t('NameCanNotBeEmpty'))
  const modalScopeRules = commonValidatorRules(t('ScopeCanNotBeEmpty'))

  const modalTitleMap = {
    create: {
      Message: 'CreateNewMessage',
      Error: 'CreateNewError',
      Signal: 'CreateNewSignal'
    },
    edit: {
      Message: 'EditMessage',
      Error: 'EditError',
      Signal: 'EditSignal'
    }
  }

  const initGlobalShapeList = () => {
    signalList.value = []
    messageList.value = []
    errorList.value = []
    if (!root) return

    const rootElements: ModdleElement[] = root.get('rootElements')

    // 设置全局缓存数据
    const globalEvents: Record<Uncapitalize<ModalType>, any> = {
      message: {},
      error: {},
      signal: {}
    }

    for (const item of rootElements) {
      if (is(item, 'bpmn:Signal')) {
        signalList.value.push({ ...item })
        globalEvents.signal[item.id] = item
        continue
      }
      if (is(item, 'bpmn:Message')) {
        messageList.value.push({ ...item })
        globalEvents.message[item.id] = item
        continue
      }
      if (is(item, 'bpmn:Error')) {
        errorList.value.push({ ...item })
        globalEvents.error[item.id] = item
      }
    }

    // 更新全局数据缓存
    updateStorage('globalEvents', globalEvents)

    modeler?.value?.get<any>('bpmnLinting')?.update()
  }

  const addElement = (type: ModalType) => {
    modalType.value = type
    modalFlag.value = 0
    modalTitle.value = t(modalTitleMap.create[type])
    if (type === 'Message' || type === 'Error') {
      modalForm.value = { id: nextId(type), name: '' }
    } else {
      modalForm.value = { id: nextId(type), name: '', scope: 'global' }
    }
    modalVisible.value = true
  }
  const editElement = (row: GlobalShape, type: ModalType) => {
    modalFlag.value = 1
    modalType.value = type
    modalTitle.value = t(modalTitleMap.edit[type])
    modalForm.value = { ...row }
    activeElement = root.get('rootElements').find((el) => el.id === row.id)
    modalVisible.value = true
  }
  const removeElement = (row: GlobalShape) => {
    updateModdleProp(
      getModule!<Modeling>('modeling'),
      currentElement!.value,
      root,
      'rootElements',
      [...root.get('rootElements').filter((item) => item.id !== row.id)]
    )
  }
  const submitElement = () => {
    modalFormRef.value?.validate().then((errors) => {
      if (errors) return errors

      !root && (root = getRoot(currentElement?.value))
      if (!root) return

      modalFlag.value > 0 ? submitUpdateElement() : submitNewElement()
    })
  }
  const submitNewElement = () => {
    const idValid = isIdValid(root, modalForm.value.id)
    if (idValid) return Message.warning(idValid)

    const newElement = createElement(
      modeler!.value!,
      `bpmn:${modalType.value}`,
      { ...modalForm.value },
      root
    )
    updateModdleProp(
      getModule!<Modeling>('modeling'),
      currentElement!.value,
      root,
      'rootElements',
      [...root.get('rootElements'), newElement]
    )
    modalVisible.value = false
    initGlobalShapeList()
  }
  const submitUpdateElement = () => {
    const { id, name, scope } = modalForm.value
    const modeling = modeler!.value!.get<Modeling>('modeling')
    updateModdleProps(modeling, root, activeElement, { id, name, scope })
    modalVisible.value = false
    initGlobalShapeList()
  }

  useElementUpdateListener(() => {
    if (!currentElement?.value) return
    root = getRoot(currentElement?.value?.businessObject)
    initGlobalShapeList()
  })
</script>

<template>
  <a-collapse-item key="GlobalConfiguration">
    <template #header>
      <LucideIcon name="Settings" />{{ $t('GlobalConfiguration') }}
      <a-tag color="blue">{{ totalConfigNums }}</a-tag>
    </template>

    <div class="panel-table-header">
      <LucideIcon name="Mail" />
      <span class="table-header_text">{{ $t('MessageList') }}</span>
      <a-button type="primary" @click="addElement('Message')">
        <icon-plus />
        {{ $t('CreateNewMessage') }}
      </a-button>
    </div>
    <a-table :columns="messageColumns" :data="messageList" :scroll="{ y: 240 }" :pagination="false">
      <template #operation="{ record }">
        <a-button type="text" @click="editElement(record, 'Message')">{{ $t('Edit') }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeElement(record)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-divider type="dashed" margin="12px" />

    <div class="panel-table-header">
      <LucideIcon name="Zap" style="transform: rotateY(180deg) rotate(90deg)" />
      <span class="table-header_text">{{ $t('ErrorList') }}</span>
      <a-button type="primary" @click="addElement('Error')">
        <icon-plus />
        {{ $t('CreateNewError') }}
      </a-button>
    </div>
    <a-table :columns="errorColumns" :data="errorList" :scroll="{ y: 240 }" :pagination="false">
      <template #operation="{ record }">
        <a-button type="text" @click="editElement(record, 'Error')">{{ $t('Edit') }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeElement(record)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-divider type="dashed" margin="12px" />

    <div class="panel-table-header">
      <LucideIcon name="Triangle" />
      <span class="table-header_text">{{ $t('SignalList') }}</span>
      <a-button type="primary" @click="addElement('Signal')">
        <icon-plus />
        {{ $t('CreateNewSignal') }}
      </a-button>
    </div>
    <a-table :columns="signalColumns" :data="signalList" :scroll="{ y: 240 }" :pagination="false">
      <template #operation="{ record }">
        <a-button type="text" @click="editElement(record, 'Signal')">{{ $t('Edit') }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeElement(record)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-drawer v-model:visible="modalVisible" :width="480" :title="modalTitle">
      <a-form ref="modalFormRef" :model="modalForm" :label-col="{ span: 4 }" label-align="right">
        <a-form-item :label="$t('Id')" field="id" :="modalIdRules">
          <a-input
            v-model:model-value="modalForm.id"
            placeholder="请输入ID"
            :disabled="!!modalFlag"
          />
        </a-form-item>
        <a-form-item :label="$t('Name')" field="name" :="modalNameRules">
          <a-input v-model:model-value="modalForm.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item
          v-if="modalType === 'Signal'"
          :label="$t('Scope')"
          field="scope"
          :="modalScopeRules"
        >
          <a-radio-group v-model="modalForm.scope">
            <a-radio value="global">{{ $t('Global') }}</a-radio>
            <a-radio value="processInstance">{{ $t('ProcessInstance') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="modalVisible = false">{{ $t('Cancel') }}</a-button>
        <a-button type="primary" @click="submitElement">{{ $t('Confirm') }}</a-button>
      </template>
    </a-drawer>
  </a-collapse-item>
</template>
