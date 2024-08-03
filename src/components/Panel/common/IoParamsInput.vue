<script setup lang="ts">
  import { type PropType } from 'vue'
  import type { FormInstance } from '@arco-design/web-vue'
  import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import type { IOParams } from '@/components/Panel/common/types'
  import { useI18n } from 'vue-i18n'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import {
    addExtensionElements,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { commonValidatorRules } from '@/utils/bpmn-validators'
  import { createExElement } from '@/utils/element-utils'
  import { updateModdleProps } from '@/utils/modeling'

  defineOptions({ name: 'IoParamsInput' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const $props = defineProps({
    label: {
      type: String as PropType<string>,
      default: ''
    },
    type: {
      type: String as PropType<string>,
      default: 'In'
    },
    icon: {
      type: String as PropType<string>,
      default: 'SquarePi'
    }
  })

  const { t } = useI18n()

  const paramsColumns = [
    { title: t('Source'), ellipsis: true, tooltip: true, dataIndex: 'source' },
    { title: t('Target'), ellipsis: true, tooltip: true, dataIndex: 'target' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]
  const paramsSourceList = shallowRef<BpmnModdleEl[]>([])
  const paramsList = ref<IOParams[]>([])

  const modalVisible = ref<boolean>(false)
  const modalForm = ref<IOParams>({})
  const modalActiveFlag = ref<number>(0) // -1: 新增; > -1: 编辑
  const modalFormRef = shallowRef<FormInstance | null>(null)
  const modalSourceRules = commonValidatorRules(t('SourceCanNotBeEmpty'))
  const modalTargetRules = commonValidatorRules(t('TargetCanNotBeEmpty'))

  const addElement = () => {
    modalActiveFlag.value = -1
    modalForm.value = {}
    modalVisible.value = true
  }
  const editElement = (row: IOParams, idx: number) => {
    modalActiveFlag.value = idx
    modalForm.value = { ...row }
    modalVisible.value = true
  }
  const removeElement = (idx: number) => {
    paramsList.value.splice(idx, 1)
  }
  const submitElement = () => {
    modalFormRef.value?.validate().then((errors) => {
      if (errors) return errors
      //
      const element = currentElement?.value
      const BO = element?.businessObject
      if (!BO) return
      if (modalActiveFlag.value === -1) {
        const params = createExElement(modeler!.value!, $props.type, { ...modalForm.value })
        addExtensionElements(modeler!.value!, element, BO, params)
      } else {
        const modeling = modeler!.value!.get<Modeling>('modeling')
        const params = paramsSourceList.value[modalActiveFlag.value]
        const { source, target } = modalForm.value
        updateModdleProps(modeling, element, params, { source, target })
      }
      modalVisible.value = false
    })
  }

  const initParamsList = () => {
    paramsList.value = []
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    paramsSourceList.value = getExExtensionElementsList(bo, $props.type)
    paramsList.value = paramsSourceList.value.map((item) => ({
      target: item.target,
      source: item.source
    }))
  }

  defineExpose({ initParamsList })
</script>

<template>
  <div class="panel-table-header">
    <LucideIcon :name="icon" />
    <span class="table-header_text">{{ $props.label }}</span>
    <a-button type="primary" @click="addElement()">
      <icon-plus />
      {{ $t('CreateParams') }}
    </a-button>
  </div>
  <a-table :columns="paramsColumns" :data="paramsList" :scroll="{ y: 240 }" :pagination="false">
    <template #operation="{ record, rowIndex }">
      <a-button type="text" @click="editElement(record, rowIndex)">{{ $t('Edit') }}</a-button>
      <a-popconfirm
        position="left"
        :content="$t('AreYouSureYouWantToDelete?')"
        :ok-text="$t('Confirm')"
        :cancel-text="$t('Cancel')"
        @ok="removeElement(rowIndex)"
      >
        <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
      </a-popconfirm>
    </template>
  </a-table>

  <a-drawer v-model:visible="modalVisible" :width="480" :title="$t('CreateParams')">
    <a-form ref="modalFormRef" :model="modalForm" :label-col="{ span: 4 }" label-align="right">
      <a-form-item :label="$t('Source')" field="source" :="modalSourceRules">
        <a-input v-model:model-value="modalForm.source" />
      </a-form-item>
      <a-form-item :label="$t('Target')" field="target" :="modalTargetRules">
        <a-input v-model:model-value="modalForm.target" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="modalVisible = false">{{ $t('Cancel') }}</a-button>
      <a-button type="primary" @click="submitElement">{{ $t('Confirm') }}</a-button>
    </template>
  </a-drawer>
</template>
