<script setup lang="ts">
  import { PropType } from 'vue'
  import { Field } from '@/helpers/listener-helpers'
  import { FormInstance } from '@arco-design/web-vue'
  import { commonValidatorRules } from '@/utils/bpmn-validators'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'FieldForm' })
  const { t } = useI18n()

  const $props = defineProps({
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    form: { type: Object as PropType<Field | null>, default: () => null },
    title: { type: String as PropType<string>, default: '' },
    confirm: {
      type: Function as PropType<(form: Field) => Promise<boolean>>,
      default: () => Promise.resolve(true)
    }
  })
  const $emits = defineEmits(['update:visible', 'update:form'])
  const computedVisible = computed({
    get: () => $props.visible,
    set: (value) => $emits('update:visible', value)
  })

  const fieldFormRef = shallowRef<FormInstance | null>(null)
  const defaultField: Field = { fieldType: 'string' }
  const fieldForm = ref<Field>({ ...defaultField })
  const fieldNameRules = commonValidatorRules(t('FieldNameCanNotBeEmpty'))
  const fieldTypeRules = commonValidatorRules(t('FieldTypeCanNotBeEmpty'))
  const fieldValueRules = commonValidatorRules(t('FieldValueCanNotBeEmpty'))

  const initFieldForm = () => {
    fieldForm.value = $props.form ? JSON.parse(JSON.stringify($props.form)) : { ...defaultField }
    fieldFormRef.value?.resetFields()
  }

  const processConfirm = async () => {
    const errors = await fieldFormRef.value?.validate()
    if (errors) return false
    return await $props.confirm(fieldForm.value)
  }

  watch(() => $props.visible, initFieldForm, { immediate: true })
</script>

<template>
  <a-drawer
    v-model:visible="computedVisible"
    width="480px"
    :title="title"
    :on-before-ok="processConfirm"
  >
    <a-form
      ref="fieldFormRef"
      :model="fieldForm"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      @finish="processConfirm"
    >
      <a-form-item field="fieldName" :label="$t('FieldName')" :="fieldNameRules">
        <a-input v-model="fieldForm.fieldName" placeholder="请输入字段名"/>
      </a-form-item>
      <a-form-item field="fieldType" :label="$t('FieldType')" :="fieldTypeRules">
        <a-radio-group v-model="fieldForm.fieldType" type="button">
          <a-radio value="string">{{ $t('string') }}</a-radio>
          <a-radio value="expression">{{ $t('expression') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="fieldValue" :label="$t('FieldValue')" :="fieldValueRules">
        <a-input v-model="fieldForm.fieldValue" placeholder="请输入值"/>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>
