<script lang="ts" setup>
  import { ComponentInstance, type PropType, ref } from 'vue'
  import { getTimerDefinitionType, getTimerEventDefinition } from '@/utils/event-definition-utils'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import {
    setTimerEventDefExpression,
    setTimerEventDefinitionType,
    TimerTypeOptions
  } from '@/helpers/timer-properties'
  import { getExpressionBody, type ModdleElGetter } from '@/helpers/common-helpers'
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import { InitRef } from '@/components/Panel/common/types'
  import StandardExpTimeCard from '@/components/Panel/common/StandardExpTimeCard.vue'
  import { Message } from '@arco-design/web-vue'
  import { useI18n } from 'vue-i18n'
  import { debounce } from '@/utils/debounce'

  defineOptions({ name: 'TimerForm' })

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const props = defineProps({
    labelWidth: {
      type: Number as PropType<number>,
      default: 60
    },
    eventTimerGetter: {
      type: Function as PropType<ModdleElGetter>,
      default: null
    }
  })

  const regRex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

  let scopedElement: BpmnElement | undefined = undefined
  let scopedTimerED: BpmnModdleEl | undefined = undefined // scopedTimerEventDefinition
  let scopedTimerEFE: BpmnModdleEl | undefined = undefined // scopedTimerEventFormalExpression

  const timerEventDefType = ref<InitRef<string>>('')
  const timerEventDefValue = ref('')
  const formatedTimerEventDefValue = ref('')
  const timerOptions = ref(TimerTypeOptions)

  const updateTimerEventDefType = (value) => {
    timerEventDefType.value = undefined
    setTimerEventDefinitionType(modeler!.value!, scopedElement!, scopedTimerED!, value)
  }
  const updateTimerEventDefExpression = () => {
    setTimerEventDefExpression(
      modeler!.value!,
      scopedElement!,
      scopedTimerEFE!,
      timerEventDefValue.value
    )
  }
  const updateTimeDate = () => {
    timerEventDefValue.value = formatedTimerEventDefValue.value
    updateTimerEventDefExpression()
  }
  const updateTimeDateFn = debounce({ delay: 0, trailing: true }, () => {
    updateTimerEventDefExpression()
  })

  const modalVisible = ref(false)
  const modalValue = ref('') // 最后的赋值数据
  const cronValue = ref('') // cron 表达式的值
  const standardValue = ref('') // 标准模式下的值
  const modalValueType = ref('cron')
  const showMoreInfo = ref(false)
  const standardExpTimeRef = ref<InitRef<ComponentInstance<typeof StandardExpTimeCard>>>()
  const updateModalValues = () => {
    if (showMoreInfo.value && modalValueType.value === 'standard') {
      const err = standardExpTimeRef.value?.validate()
      if (err) {
        Message.error(t(err))
        return false
      }
      timerEventDefValue.value = modalValue.value = standardValue.value
      updateTimerEventDefExpression()
      return true
    } else {
      if (showMoreInfo.value) {
        modalValue.value = cronValue.value
      }
      timerEventDefValue.value = modalValue.value
      updateTimerEventDefExpression()
      return true
    }
  }
  const openModal = () => {
    standardValue.value = cronValue.value = ''
    modalValue.value = timerEventDefValue.value
    if (timerEventDefType.value === 'timeDuration') {
      showMoreInfo.value = false
    } else {
      showMoreInfo.value = true
      // 简单进行格式校验
      if (!timerEventDefValue.value || timerEventDefValue.value.split(' ').length > 5) {
        cronValue.value = modalValue.value
        modalValueType.value = 'cron'
      } else if (
        timerEventDefValue.value.startsWith('R') &&
        timerEventDefValue.value.split('/').length === 3
      ) {
        standardValue.value = modalValue.value
        modalValueType.value = 'standard'
      }
    }
    modalVisible.value = true
  }

  const reloadElementData = () => {
    scopedElement = currentElement!.value!
    scopedTimerED = getTimerEventDefinition(
      (props.eventTimerGetter && props.eventTimerGetter(scopedElement)) || scopedElement!
    )
    timerEventDefType.value = getTimerDefinitionType(scopedTimerED) || ''
    if (scopedTimerED && timerEventDefType.value) {
      scopedTimerEFE = scopedTimerED.get(timerEventDefType.value)
      timerEventDefValue.value = getExpressionBody(scopedTimerEFE)
      if (regRex.test(timerEventDefValue.value)) {
        formatedTimerEventDefValue.value = timerEventDefValue.value
      }
    } else {
      scopedTimerEFE = undefined
      formatedTimerEventDefValue.value = timerEventDefValue.value = ''
    }
  }
  useElementUpdateListener(reloadElementData)
</script>

<template>
  <edit-item :label-width="labelWidth" :label="$t('TimerEventDefType')">
    <a-radio-group v-model="timerEventDefType" type="button" @change="updateTimerEventDefType">
      <a-radio v-for="i in timerOptions" :key="i.value" :value="i.value">{{ $t(i.name) }}</a-radio>
    </a-radio-group>
  </edit-item>
  <edit-item v-if="!!timerEventDefType" :label-width="labelWidth" :label="$t('TimerEventDefValue')">
    <a-input-group v-if="timerEventDefType === 'timeDate'" key="timeDate">
      <a-input v-model="timerEventDefValue" placeholder="请输入时间" @input="updateTimeDateFn" />
      <a-date-picker
        v-if="timerEventDefType === 'timeDate'"
        v-model="formatedTimerEventDefValue"
        position="lt"
        value-format="YYYY-MM-DDTHH:mm:ss"
        show-time
        @change="updateTimeDate"
      >
        <a-button>
          <a-icon-calendar />
        </a-button>
      </a-date-picker>
    </a-input-group>

    <a-input-group v-else key="timeCycle">
      <a-input
        v-model="timerEventDefValue"
        placeholder="请输入条件"
        @change="updateTimerEventDefExpression"
      />
      <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
    </a-input-group>
  </edit-item>

  <a-drawer
    v-model:visible="modalVisible"
    :width="showMoreInfo ? 800 : 540"
    title="时间配置"
    :on-before-ok="updateModalValues"
  >
    <ExpirationTimeCard v-if="!showMoreInfo && modalVisible" v-model:value="modalValue" />

    <edit-item v-if="showMoreInfo && modalVisible" label="时间格式">
      <a-radio-group v-model="modalValueType" @change="modalValue = ''">
        <a-radio value="cron">Cron</a-radio>
        <a-radio value="standard">标准格式</a-radio>
      </a-radio-group>
    </edit-item>
    <CronCard
      v-if="modalVisible && showMoreInfo && modalValueType === 'cron'"
      v-model:value="cronValue"
    />
    <StandardExpTimeCard
      v-if="modalVisible && showMoreInfo && modalValueType === 'standard'"
      ref="standardExpTimeRef"
      v-model:value="standardValue"
    />
  </a-drawer>
</template>
