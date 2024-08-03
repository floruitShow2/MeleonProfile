<script setup lang="ts">
  import { ComponentInstance, PropType } from 'vue'
  import { InitRef } from '@/components/Panel/common/types'
  import ExpirationTimeCard from '@/components/Panel/common/ExpirationTimeCard.vue'

  defineOptions({ name: 'StandardExpTimeCard' })

  const $props = defineProps({
    value: { type: String as PropType<string>, default: '' },
    showHeader: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    labelWidth: { type: Number as PropType<number>, default: 80 }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const standardValue = computed(() => {
    const [cycle = 'R1', time = '', expTime = ''] = $props.value.split('/')
    return {
      cycle,
      time,
      expTime
    }
  })
  const timeReg = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

  const cycleTime = computed({
    get: () => Number(standardValue.value.cycle?.replace('R', '')).valueOf() || 1,
    set: (val) => updateValue(val, time.value, expTime.value)
  })
  const time = computed({
    get: () => {
      const val = standardValue.value.time
      return timeReg.test(val) ? val : ''
    },
    set: (val) => updateValue(cycleTime.value, val, expTime.value)
  })
  const expTime = computed({
    get: () => standardValue.value.expTime,
    set: (val) => updateValue(cycleTime.value, time.value, val)
  })

  const updateValue = (cycle: number, time: string, expTime: string) => {
    const value = `R${cycle || '-'}/${time || '-'}/${expTime || '-'}`

    $emits('update:value', value)
    $emits('change', value)
  }

  const expTimeCardRef = ref<InitRef<ComponentInstance<typeof ExpirationTimeCard>>>()
  const validate = () => {
    const expValid = expTimeCardRef.value!.validate()
    if (expValid) {
      return expValid
    }
    if (!expTime.value) {
      return 'CycleConfigCanNotBeEmpty'
    }
    if (!cycleTime.value) {
      return 'CycleCanNotBeEmpty'
    }
    if (!time.value) {
      return 'DateAndTimeCanNotBeEmpty'
    }
    if (!timeReg.test(time.value)) {
      return 'TheFormatOfTheTimeIsAbnormal'
    }

    return undefined
  }

  defineExpose({ validate })
</script>

<template>
  <div class="standard-exptime-card">
    <div class="exptime-preview-card">
      <div v-if="showHeader" class="exptime-card_header">{{ $t('CRON Expression') }}</div>
      <div class="exptime-card_expression">{{ value || '-/-/-' }}</div>
    </div>
    <edit-item label="循环次数" :label-width="labelWidth">
      <a-input-number v-model="cycleTime" :min="1" :step="1" :precision="0" />
    </edit-item>
    <edit-item label="日期时间" :label-width="labelWidth">
      <a-date-picker key="timeDate" v-model="time" value-format="YYYY-MM-DDTHH:mm:ss" show-time />
    </edit-item>
    <ExpirationTimeCard ref="expTimeCardRef" v-model:value="expTime" :label-width="labelWidth" />
  </div>
</template>

<style lang="scss" scoped>
  .exptime-preview-card {
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
    .exptime-card_header,
    .exptime-card_expression {
      text-align: center;
      padding: 8px 24px;
      font-size: 1.4rem;
      font-weight: 500;
    }
    .exptime-card_expression {
      background: rgb(240, 248, 255);
      border-radius: 2px;
    }
  }
</style>
