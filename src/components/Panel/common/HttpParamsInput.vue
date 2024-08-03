<script setup lang="ts">
  import { PropType } from 'vue'
  import { HttpPrams } from '@/components/Panel/common/types'
  import { debounce } from '@/utils/debounce'

  defineOptions({ name: 'HttpParamsInput' })

  type ValidateParamsCb = (item?: Required<HttpPrams>) => unknown

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const paramsValue = ref<string>()
  const paramsList = ref<HttpPrams[]>([])
  watch(
    () => $props.value,
    (val) => {
      paramsValue.value = val
      paramsList.value = []
      if (val) {
        const paramsObject = JSON.parse(val)
        Object.keys(paramsObject).forEach((key: string) => {
          paramsList.value.push({ key, value: paramsObject[key] })
        })
      }
    },
    { immediate: true }
  )

  const modalVisible = ref<boolean>(false)
  const hasError = ref<boolean>(false)

  const openModal = () => {
    if (!paramsList.value.length) {
      paramsList.value.push({ key: '', value: '' })
    }
    modalVisible.value = true
  }

  const addParams = () => {
    paramsList.value.push({ key: '', value: '' })
  }
  const removeParams = (idx: number) => {
    paramsList.value.splice(idx, 1)
  }

  const validateParams = (callback?: ValidateParamsCb) => {
    hasError.value = false
    for (const item of paramsList.value) {
      if (!item.key) {
        hasError.value = true
        throw new Error()
      }
      callback && callback(item as Required<HttpPrams>)
    }
  }

  const throttleValidate = debounce({ delay: 0, trailing: true }, () => validateParams())

  const submitParams = () => {
    const params: Record<string, string | undefined> = {}
    validateParams((item) => (params[item!.key] = item!.value))
    paramsValue.value = JSON.stringify(params)
    $emits('update:value', paramsValue.value)
    $emits('change', paramsValue.value)
    modalVisible.value = false
  }
</script>

<template>
  <div class="http-params-input">
    <a-textarea :model-value="paramsValue" :autosize="{ minRows: 2, maxRows: 4 }" readonly />
    <a-button type="outline" style="height: auto" @click="openModal">
      <LucideIcon name="Plus" />
    </a-button>
  </div>

  <a-drawer v-model:visible="modalVisible" :width="540" :title="$t('SettingParams')">
    <div class="params-grid-table">
      <div class="params-grid-item params-grid-header">{{ $t('Key') }}</div>
      <div class="params-grid-item params-grid-header">{{ $t('Value') }}</div>
      <div class="params-grid-item params-grid-header">{{ $t('Operation') }}</div>
      <template v-for="(p, idx) in paramsList" :key="idx">
        <div class="params-grid-item"><a-input v-model="p.key" @input="throttleValidate" /></div>
        <div class="params-grid-item"><a-input v-model="p.value" /></div>
        <div class="params-grid-item">
          <a-button type="text" @click="addParams">{{ $t('Add') }}</a-button>
          <a-popconfirm
            position="left"
            :content="$t('AreYouSureYouWantToDelete?')"
            :ok-text="$t('Confirm')"
            :cancel-text="$t('Cancel')"
            @ok="removeParams(idx)"
          >
            <a-button v-show="paramsList.length > 1" type="text" status="danger">{{
              $t('Remove')
            }}</a-button>
          </a-popconfirm>
        </div>
      </template>
    </div>
    <a-alert v-show="hasError" type="error">{{ $t('ParamsKeyCanNotBeEmpty') }}</a-alert>

    <template #footer>
      <a-button @click="modalVisible = false">{{ $t('Cancel') }}</a-button>
      <a-button type="primary" @click="submitParams">{{ $t('Confirm') }}</a-button>
    </template>
  </a-drawer>
</template>

<style lang="scss" scoped>
  .http-params-input {
    display: flex;
    flex-shrink: 1;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
  }

  .params-grid-table {
    display: grid;
    grid-template-columns: repeat(2, 1fr) 132px;
    align-items: center;
    background-color: rgb(var(--gray-2));
  }
  .params-grid-header {
    padding: 0 10px;
    font-weight: bold;
  }
  .params-grid-item {
    height: 40px;
    border-bottom: 1px solid rgb(var(--gray-3));
    display: flex;
    align-items: center;
    padding: 0 8px;
  }
</style>
