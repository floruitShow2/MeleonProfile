<script setup lang="ts">
  import { PropType } from 'vue'
  import { ExpTimeMode } from '@/components/Panel/common/types'

  defineOptions({ name: 'ExpirationTimeCard' })

  const $props = defineProps({
    value: { type: String as PropType<string>, default: '' },
    labelWidth: { type: Number as PropType<number>, default: 80 }
  })
  const $emits = defineEmits(['update:value', 'change'])

  // P1Y2M3DT4H5M6S
  type TimeType = 'TS' | 'TM' | 'TH' | 'D' | 'M' | 'Y'
  type TimeTypeOption = { key: TimeType; label: string; max: number; options: number[] }
  type TimeCheckData = {
    [key in TimeType]: ExpTimeMode
  }

  const regRex = /\d+Y|\d{1,2}[MDHS]|T/g
  const timeTypes: TimeTypeOption[] = [
    { key: 'TS', label: 'Second', max: 60, options: [5, 10, 30, 50] },
    { key: 'TM', label: 'Minute', max: 60, options: [5, 10, 30, 50] },
    { key: 'TH', label: 'Hour', max: 24, options: [4, 8, 12, 24] },
    { key: 'D', label: 'Day', max: 31, options: [1, 2, 3, 4] },
    { key: 'M', label: 'Month', max: 12, options: [1, 2, 3, 4] },
    { key: 'Y', label: 'Year', max: 4000, options: [1, 2, 3, 4] }
  ]
  const timeTypesMap = timeTypes.reduce(
    (m, c) => (m[c.key] = c.options) && m,
    {} as Record<TimeType, number[]>
  )
  const emptyTimesCheck: TimeCheckData = {
    TS: { custom: false },
    TM: { custom: false },
    TH: { custom: false },
    D: { custom: false },
    M: { custom: false },
    Y: { custom: false }
  }

  const timesCheck = ref<TimeCheckData>(JSON.parse(JSON.stringify(emptyTimesCheck)))
  const realtimeValue = ref($props.value)

  const clear = () => {
    timesCheck.value = JSON.parse(JSON.stringify(emptyTimesCheck))
  }
  const initTimesCheck = (value?: string) => {
    clear()
    if (!value || !value.length) return
    const matches = value.match(regRex)
    if (!matches?.length) return

    let flag: boolean = false
    for (const match of matches) {
      if (match === 'T') {
        flag = true
        continue
      }
      const type = match[match.length - 1]
      const val = Number(match.slice(0, -1)).valueOf()
      const key = (flag ? `T${type}` : type) as TimeType
      if (timeTypesMap[key].includes(val)) {
        timesCheck.value[key].custom = false
        timesCheck.value[key].value = val
        timesCheck.value[key].num = 0
      } else {
        timesCheck.value[key].custom = true
        timesCheck.value[key].value = 'custom'
        timesCheck.value[key].num = val
      }
    }
  }
  const toRealtime = (data: TimeCheckData) => {
    const { Y, M, D, TH, TM, TS } = data
    const array = [Y, M, D, TH, TM, TS]
    let res: string = ''
    let tAdd = TH.value || TH.num || TM.value || TM.num || TS.value || TS.num
    let tAdded: boolean = false
    for (let i = 0; i < 6; i++) {
      const item = array[i]

      const unit = i > 2 ? timeTypes[5 - i].key.slice(1) : timeTypes[5 - i].key

      if (i > 2 && tAdd && !tAdded) {
        if (item.custom) {
          res += `T${item.num}${unit}`
          tAdded = true
        } else if (item.value) {
          res += `T${item.value}${unit}`
          tAdded = true
        }
        continue
      }

      if (item.custom) {
        item.num && (res += `${item.num}${unit}`)
      } else {
        item.value && (res += `${item.value}${unit}`)
      }
    }
    return res.length ? `P${res}` : ''
  }

  const updateTimeCheckType = (key: TimeType, value: number | string | boolean) => {
    if (value === 'custom') {
      timesCheck.value[key].num = 0
      timesCheck.value[key].custom = true
    } else {
      timesCheck.value[key].custom = false
    }
  }

  const validate = () => {
    // const { custom, num } = expTime.value
    // if (custom && !num) {
    //   return 'ExpirationTimeDoesNotConformToTheFormat'
    // }
    // if (!expTimeReg.test(realtimeValue.value)) {
    //   return 'TheFormatOfTheTimeIsAbnormal'
    // }
    return undefined
  }

  // watch(
  //   () => $props.value,
  //   (value) => initTimesCheck(value),
  //   { immediate: true }
  // )
  onMounted(() => {
    watch(
      () => timesCheck.value,
      () => {
        realtimeValue.value = toRealtime(timesCheck.value)
        $emits('update:value', realtimeValue.value)
        $emits('change', realtimeValue.value)
      },
      { deep: true }
    )

    initTimesCheck($props.value)
  })

  defineExpose({ validate, initTimesCheck })
</script>

<template>
  <edit-item :label-width="labelWidth" :label="$t('CurrentSelect')">
    <a-input-group>
      <a-input
        class="is-readonly"
        :model-value="realtimeValue"
        readonly
        placeholder="请选择下面时间"
      />
      <a-button @click="clear">
        <a-icon-close-circle-fill />
      </a-button>
    </a-input-group>
  </edit-item>
  <edit-item v-for="i in timeTypes" :key="i.key" :label-width="labelWidth" :label="$t(i.label)">
    <a-radio-group
      v-model="timesCheck[i.key].value"
      type="button"
      @change="(val) => updateTimeCheckType(i.key, val)"
    >
      <a-radio v-for="op in i.options" :key="op" :value="op">{{ op }}</a-radio>
      <a-radio key="custom" value="custom">{{ $t('Custom') }}</a-radio>
    </a-radio-group>
    <a-input-number
      v-if="timesCheck[i.key].custom"
      v-model="timesCheck[i.key].num"
      :step="1"
      :precision="0"
      :min="1"
      :max="i.max"
      mode="button"
      style="display: inline-flex; width: 120px; margin-left: 8px"
    />
  </edit-item>
</template>
