<script setup lang="ts">
  import type { PropType } from 'vue'
  import type { Field, Listener } from '@/helpers/listener-helpers'
  import { useI18n } from 'vue-i18n'
  import { commonValidatorRules } from '@/utils/bpmn-validators'
  import { FormInstance, TableColumnData } from '@arco-design/web-vue'

  const { t } = useI18n()
  defineOptions({ name: 'ListenerForm' })

  const $props = defineProps({
    visible: { type: Boolean as PropType<boolean>, default: false },
    form: { type: Object as PropType<Listener | null>, default: () => null },
    title: { type: String as PropType<string>, default: '' },
    listenerType: {
      type: String as PropType<'executionListener' | 'taskListener'>,
      default: 'executionListener'
    },
    eventTypeOptions: { type: Array as PropType<PropertyOptions>, default: () => [] },
    listenerTypeOptions: { type: Array as PropType<PropertyOptions>, default: () => [] },
    confirm: {
      type: Function as PropType<(form: Listener) => Promise<boolean>>,
      default: () => Promise.resolve(true)
    }
  })
  const $emits = defineEmits(['update:visible', 'update:form'])

  const computedVisible = computed({
    get: () => $props.visible,
    set: (value) => $emits('update:visible', value)
  })

  const listenerFormRef = shallowRef<FormInstance | null>(null)
  const defaultListener: Listener = { event: 'start', listenerType: 'class', fields: [] }
  const listenerForm = ref<Listener>(JSON.parse(JSON.stringify(defaultListener)))
  const eventTypeRules = commonValidatorRules(t('EventTypeCanNotBeEmpty'))
  const listenerTypeRules = commonValidatorRules(t('ListenerTypeCanNotBeEmpty'))
  const listenerContentRules = commonValidatorRules(t('ListenerContentCanNotBeEmpty'))

  const initListenerForm = () => {
    defaultListener.event = $props.listenerType === 'taskListener' ? 'create' : 'start'
    listenerForm.value = $props.form
      ? JSON.parse(JSON.stringify($props.form))
      : JSON.parse(JSON.stringify(defaultListener))

    listenerFormRef.value?.resetFields()
  }

  const updateListenerData = (_, listener: any) => {
    const { name, type, value, flowListenerParamList: fieldList } = listener
    listenerForm.value.listenerType = type
    listenerForm.value.listenerContent = value
    listenerForm.value.fields = (fieldList || []).map((field) => {
      return {
        fieldName: field.name,
        fieldType: field.type,
        fieldValue: field.value
      }
    })
    listenerFormRef.value?.validate()
  }

  const processConfirm = async () => {
    const errors = await listenerFormRef.value?.validate()
    if (errors) return false
    return await $props.confirm(listenerForm.value)
  }

  const fieldColumns: TableColumnData[] = [
    {
      title: t('FieldName'),
      ellipsis: true,
      tooltip: true,
      dataIndex: 'fieldName'
    },
    {
      title: t('FieldType'),
      ellipsis: true,
      tooltip: true,
      dataIndex: 'fieldType',
      render: ({ record }) => (record.fieldType ? t(record.fieldType) : '-')
    },
    {
      title: t('FieldValue'),
      ellipsis: true,
      tooltip: true,
      dataIndex: 'fieldValue'
    },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const fieldModalVisible = ref(false)
  const modalFieldForm = ref<Field | undefined>()
  let activeFieldIdx = ref<number>(-1)

  const removeField = (idx: number) => {
    listenerForm.value.fields.splice(idx, 1)
  }
  const openFieldModal = (row?: Field, idx?: number) => {
    modalFieldForm.value = row
    if (idx !== undefined) {
      activeFieldIdx.value = idx
    } else {
      activeFieldIdx.value = -1
    }
    fieldModalVisible.value = true
  }
  const submitField = async (field: Field) => {
    if (activeFieldIdx.value > -1) {
      listenerForm.value.fields.splice(activeFieldIdx.value, 1, { ...field })
    } else {
      listenerForm.value.fields.push({ ...field })
    }
    return true
  }

  watch(
    () => $props.visible,
    () => initListenerForm(),
    { immediate: true }
  )
</script>

<template>
  <a-drawer
    v-model:visible="computedVisible"
    width="540px"
    :title="title"
    :on-before-ok="processConfirm"
  >
    <a-form
      ref="listenerFormRef"
      :model="listenerForm"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      @finish="processConfirm"
    >
      <a-form-item field="event" :label="$t('EventType')" :="eventTypeRules">
        <a-radio-group v-model="listenerForm.event" type="button">
          <a-radio v-for="i in eventTypeOptions" :key="i.value" :value="i.value">{{
            $t(i.name.toLowerCase())
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="listenerType" :label="$t('ListenerType')" :="listenerTypeRules">
        <a-radio-group v-model="listenerForm.listenerType" type="button">
          <a-radio v-for="i in listenerTypeOptions" :key="i.value" :value="i.value">{{
            $t(i.name.toLowerCase())
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="listenerContent" :label="$t('ListenerContent')" :="listenerContentRules">
        <!--        <a-input-group>-->
        <!--          <a-input v-model="listenerForm.listenerContent" />-->
        <!--          <a-button type="primary"><LucideIcon name="Search" /></a-button>-->
        <!--        </a-input-group>-->
        <ListenerTagInput
          v-model:value="listenerForm.listenerContent"
          :listener-type="listenerType"
          @change="updateListenerData"
        />
      </a-form-item>
    </a-form>

    <!--  注入字段处理  -->
    <a-divider type="dashed" margin="12px" />
    <div class="panel-table-header">
      <lucide-icon name="RectangleEllipsis" />
      <span class="table-header_text">{{ $t('InjectField') }}</span>
      <a-button type="primary" @click="openFieldModal()">
        <icon-plus />
        {{ $t('CreateNewField') }}
      </a-button>
    </div>

    <a-table :columns="fieldColumns" :data="listenerForm.fields" :pagination="false">
      <template #operation="{ record, rowIndex }">
        <a-button type="text" @click="openFieldModal(record, rowIndex)">{{ $t('Edit') }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removeField(rowIndex)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <FieldForm
      v-model:visible="fieldModalVisible"
      v-model:form="modalFieldForm"
      :title="$t('InjectField')"
      :confirm="submitField"
    />
  </a-drawer>
</template>
