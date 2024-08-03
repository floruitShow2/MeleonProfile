<script setup lang="ts">
  import { PropType } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { useI18n } from 'vue-i18n'
  import { ExpTimeMode } from '@/components/Panel/common/types'
  import {
    generateExpTimeString,
    initExpTimeData,
    minutesOptions,
    hoursOptions,
    commonOptions
  } from '@/components/Panel/common/utils'

  defineOptions({ name: 'ExpirationTimeInput' })

  const $props = defineProps({
    value: { type: String as PropType<string>, default: '' },
    title: { type: String as PropType<string>, default: '' }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const modalVisible = ref(false)

  const modalValue = ref('')
  const computedValue = computed({
    get: () => $props.value,
    set: (newValue) => {
      $emits('update:value', newValue)
      $emits('change', newValue)
    }
  })

  const openModal = () => {
    modalValue.value = $props.value
    modalVisible.value = true
  }

  const submitExpTime = () => {
    $emits('update:value', modalValue.value)
    $emits('change', modalValue.value)
    return true
  }
</script>

<template>
  <a-input-group>
    <a-input v-model="computedValue" placeholder="请配置到期时间" />
    <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
  </a-input-group>

  <a-drawer
    v-model:visible="modalVisible"
    width="540px"
    :title="title"
    :on-before-ok="submitExpTime"
  >
    <ExpirationTimeCard v-if="modalVisible" v-model:value="modalValue" />
  </a-drawer>
</template>
