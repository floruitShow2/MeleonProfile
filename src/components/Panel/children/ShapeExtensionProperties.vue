<script setup lang="ts">
  import { ref } from 'vue'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { getRelevantBusinessObject } from '@/helpers/common-helpers'
  import {
    createProperty,
    getProperties,
    getPropertiesList,
    removeProperty
  } from '@/helpers/extension-properties'
  import { updateExModdleProps } from '@/utils/modeling'
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import { useI18n } from 'vue-i18n'
  import { nextId } from '@/utils/element-utils'
  import { commonValidatorRules, idValidator, isIdValid } from '@/utils/bpmn-validators'
  import { FormInstance, Message } from '@arco-design/web-vue'

  type PropertyItem = {
    id: string
    name?: string
    value?: string
  }

  const { t } = useI18n()

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  let scopedElement: BpmnElement | undefined = undefined
  let scopedBO: BpmnModdleEl | undefined = undefined
  let scopedProperties: BpmnModdleEl | undefined = undefined
  let scopedPropertiesList: BpmnModdleEl[] | undefined = undefined

  let activeProperty: BpmnModdleEl | undefined = undefined
  let activeIdx: number = -1

  const properties = ref<PropertyItem[]>([])
  const propertyForm = ref<PropertyItem>({
    id: ''
  })
  const propertyModalVisible = ref<boolean>(false)

  const propertyColumns = [
    { title: t('PropName'), ellipsis: true, tooltip: true, dataIndex: 'name' },
    { title: t('PropValue'), ellipsis: true, tooltip: true, dataIndex: 'value' },
    { title: t('Operation'), width: 160, slotName: 'operation' }
  ]

  const propIdRules = commonValidatorRules(t('PropId'), idValidator)
  const propNameRules = commonValidatorRules(t('PropNameCanNotBeEmpty'))
  const propValueRules = commonValidatorRules(t('PropValueCanNotBeEmpty'))
  const propFormRef = shallowRef<FormInstance | null>(null)

  // 打开弹窗
  const openPropertyFormModal = (row?: PropertyItem, idx?: number) => {
    // 编辑
    if (row) {
      activeIdx = idx!
      activeProperty = scopedPropertiesList![activeIdx]
      propertyForm.value = {
        id: activeProperty?.get('id'),
        name: activeProperty?.get('name'),
        value: activeProperty?.get('value')
      }
    }
    // 新增
    else {
      activeIdx = -1
      propertyForm.value = { id: nextId('Property') }
    }
    propertyModalVisible.value = true
  }
  // 保存
  const submitProperty = () => {
    propFormRef.value?.validate().then((errors) => {
      if (errors) return errors
      const { id, name, value } = propertyForm.value
      if (activeIdx === -1) {
        const idValidate = isIdValid(currentElement!.value?.businessObject, id)
        if (idValidate) {
          return Message.error(idValidate)
        }
        createProperty(modeler!.value!, scopedElement!, scopedBO!, { id, name, value })
      } else {
        updateExModdleProps(
          modeler!.value!.get('modeling'),
          currentElement!.value,
          scopedPropertiesList![activeIdx],
          { name, value }
        )
      }
      propertyModalVisible.value = false
    })
  }
  // 移除
  const removePropertyItem = (idx: number) => {
    removeProperty(modeler!.value!, scopedElement!, scopedBO!, scopedPropertiesList![idx])
  }

  useElementUpdateListener(() => {
    scopedElement = currentElement!.value
    if (!scopedElement) return
    scopedBO = getRelevantBusinessObject(currentElement!.value)
    scopedProperties = getProperties(scopedBO)[0]
    if (scopedProperties) {
      scopedPropertiesList = getPropertiesList(scopedProperties) || []
      properties.value =
        scopedPropertiesList?.map((property: BpmnModdleEl) => {
          return {
            id: property.get('id'),
            name: property.get('name'),
            value: property.get('value')
          }
        }) || []
    } else {
      properties.value = scopedPropertiesList = []
    }
  })
</script>

<template>
  <a-collapse-item key="ExtensionProperties">
    <template #header>
      <LucideIcon name="ImagePlus" />{{ $t('ExtensionProperties') }}
      <a-tag color="blue">{{ properties.length }}</a-tag>
    </template>

    <a-table :columns="propertyColumns" :data="properties" :scroll="{ y: 240 }" :pagination="false">
      <template #operation="{ record, rowIndex }">
        <a-button type="text" @click="openPropertyFormModal(record, rowIndex)">{{
          $t('Edit')
        }}</a-button>
        <a-popconfirm
          position="left"
          :content="$t('AreYouSureYouWantToDelete?')"
          :ok-text="$t('Confirm')"
          :cancel-text="$t('Cancel')"
          @ok="removePropertyItem(rowIndex)"
        >
          <a-button type="text" status="danger">{{ $t('Remove') }}</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-button type="primary" class="inline-large-button" long @click="openPropertyFormModal()">
      <icon-plus />
      {{ $t('AddProperty') }}
    </a-button>

    <a-drawer v-model:visible="propertyModalVisible" :width="480" :title="$t('PropertyModal')">
      <a-form
        v-if="propertyModalVisible"
        ref="propFormRef"
        :model="propertyForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
        @finish="submitProperty"
      >
        <a-form-item field="id" :label="$t('Id')" :="propIdRules">
          <a-input v-model:model-value="propertyForm.id" disabled />
        </a-form-item>
        <a-form-item field="name" :label="$t('PropName')" :="propNameRules">
          <a-input v-model:model-value="propertyForm.name" placeholder="请输入属性名"/>
        </a-form-item>
        <a-form-item field="value" :label="$t('PropValue')" :="propValueRules">
          <a-input v-model:model-value="propertyForm.value" placeholder="请输入属性值"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="propertyModalVisible = false">取消</a-button>
        <a-button type="primary" @click="submitProperty">确定</a-button>
      </template>
    </a-drawer>
  </a-collapse-item>
</template>
