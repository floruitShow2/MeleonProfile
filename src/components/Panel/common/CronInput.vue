<script setup lang="ts">
  import { useCronExpression, WeekdayOptions } from '@flowable-designer/shared/hooks'
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'CronInput' })

  const { t } = useI18n()

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '时间配置'
    },
    showHeader: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  })
  const $emits = defineEmits(['update:data', 'change'])

  const {
    cronExpression,
    secondData,
    minuteData,
    hourData,
    dayWeekdayData,
    monthData,
    yearData,
    secondValue,
    minuteValue,
    hourValue,
    dayWeekdayValue,
    monthValue,
    yearValue,
    initCronExpression
  } = useCronExpression(undefined, '0 0 12 ? * 2-6')

  const modalVisible = ref(false)
  const activeTab = ref<string>('second')
  const modalValues = ref<string>($props.value)

  const secondsAndMinutes = new Array(60)
    .fill(0)
    .map((_, idx) => ({ label: `${idx}`.padStart(2, '0'), value: idx }))
  const hours = new Array(24)
    .fill(0)
    .map((_, idx) => ({ label: `${idx}`.padStart(2, '0'), value: idx }))
  const months = new Array(12)
    .fill(0)
    .map((_, idx) => ({ label: `${idx + 1}`.padStart(2, '0'), value: idx + 1 }))
  const days = new Array(31)
    .fill(0)
    .map((_, idx) => ({ label: `${idx + 1}`.padStart(2, '0'), value: idx + 1 }))
  const weekdays = WeekdayOptions.map((i) => ({ label: t(i.label), value: i.value }))
  const currentYear = new Date().getFullYear()
  const years = new Array(100)
    .fill(0)
    .map((_, idx) => ({ label: idx + currentYear, value: idx + currentYear }))

  const updateModalValues = () => {
    $emits('update:data', modalValues)
    $emits('change', modalValues)
  }

  const openModal = () => {
    activeTab.value = 'second'
    modalVisible.value = true
  }

  defineExpose({ initCronExpression })
</script>

<template>
  <a-input-group>
    <a-input v-model="cronExpression" />
    <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
  </a-input-group>

  <a-drawer
    v-model:visible="modalVisible"
    width="800px"
    :title="modalTitle"
    @ok="updateModalValues"
  >
    <div class="cron-preview-card">
      <div v-if="showHeader" class="cron-card_header">{{ $t('CRON Expression') }}</div>
      <div class="cron-card_expression">{{ cronExpression }}</div>
      <div class="cron-card_exp-header">
        <span @click="activeTab = 'second'">{{ $t('Second') }}</span>
        <span @click="activeTab = 'minute'">{{ $t('Minute') }}</span>
        <span @click="activeTab = 'hour'">{{ $t('Hour') }}</span>
        <span @click="activeTab = 'day'">{{ $t('Day') }}</span>
        <span @click="activeTab = 'month'">{{ $t('Month') }}</span>
        <span @click="activeTab = 'day'">{{ $t('Week') }}</span>
        <span @click="activeTab = 'year'">{{ $t('Year') }}</span>
      </div>
      <div class="cron-card_exp-content">
        <a-input :model-value="secondValue" readonly @focus="activeTab = 'second'" />
        <a-input :model-value="minuteValue" readonly @focus="activeTab = 'minute'" />
        <a-input :model-value="hourValue" readonly @focus="activeTab = 'hour'" />
        <a-input :model-value="dayWeekdayValue[0]" readonly @focus="activeTab = 'day'" />
        <a-input :model-value="monthValue" readonly @focus="activeTab = 'month'" />
        <a-input :model-value="dayWeekdayValue[1]" readonly @focus="activeTab = 'day'" />
        <a-input :model-value="yearValue" readonly @focus="activeTab = 'year'" />
      </div>
    </div>
    <a-tabs v-model:active-key="activeTab" size="large">
      <a-tab-pane key="second" :title="$t('Second')">
        <a-radio-group v-model="secondData.checkedType" direction="vertical">
          <a-radio value="every">每秒</a-radio>
          <a-radio value="range">
            <a-space>
              从
              <a-input-number
                v-model="secondData.range.from"
                :min="0"
                :max="secondData.range.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="secondData.range.to"
                :min="secondData.range.from"
                :max="59"
                :precision="0"
                :step="1"
              />
              之间的每一秒
            </a-space>
          </a-radio>
          <a-radio value="average">
            <a-space>
              从第
              <a-input-number
                v-model="secondData.average.from"
                :min="0"
                :max="59"
                :precision="0"
                :step="1"
              />
              秒开始每隔
              <a-input-number
                v-model="secondData.average.step"
                :min="1"
                :max="59"
                :precision="0"
                :step="1"
              />
              秒
            </a-space>
          </a-radio>
          <a-radio value="specify"> 指定：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="secondData.specify" :options="secondsAndMinutes" />
          </div>
        </a-radio-group>
      </a-tab-pane>
      <a-tab-pane key="minute" :title="$t('Minute')">
        <a-radio-group v-model="minuteData.checkedType" direction="vertical">
          <a-radio value="every">每分钟</a-radio>
          <a-radio value="range">
            <a-space>
              从
              <a-input-number
                v-model="minuteData.range.from"
                :min="0"
                :max="minuteData.range.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="minuteData.range.to"
                :min="minuteData.range.from"
                :max="59"
                :precision="0"
                :step="1"
              />
              之间的每一分钟
            </a-space>
          </a-radio>
          <a-radio value="average">
            <a-space>
              从第
              <a-input-number
                v-model="minuteData.average.from"
                :min="0"
                :max="59 - minuteData.average.step"
                :precision="0"
                :step="1"
              />
              分钟开始每隔
              <a-input-number
                v-model="minuteData.average.step"
                :min="1"
                :max="59 - minuteData.average.from"
                :precision="0"
                :step="1"
              />
              分钟
            </a-space>
          </a-radio>
          <a-radio value="specify"> 指定：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="minuteData.specify" :options="secondsAndMinutes" />
          </div>
        </a-radio-group>
      </a-tab-pane>
      <a-tab-pane key="hour" :title="$t('Hour')">
        <a-radio-group v-model="hourData.checkedType" direction="vertical">
          <a-radio value="every">每小时</a-radio>
          <a-radio value="range">
            <a-space>
              从
              <a-input-number
                v-model="hourData.range.from"
                :min="0"
                :max="hourData.range.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="hourData.range.to"
                :min="hourData.range.from"
                :max="59"
                :precision="0"
                :step="1"
              />
              之间的每一小时
            </a-space>
          </a-radio>
          <a-radio value="average">
            <a-space>
              从第
              <a-input-number
                v-model="hourData.average.from"
                :min="1"
                :max="24 - hourData.average.step"
                :precision="0"
                :step="1"
              />
              小时开始每隔
              <a-input-number
                v-model="hourData.average.step"
                :min="1"
                :max="24 - hourData.average.from"
                :precision="0"
                :step="1"
              />
              小时
            </a-space>
          </a-radio>
          <a-radio value="specify"> 指定：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="hourData.specify" :options="hours" />
          </div>
        </a-radio-group>
      </a-tab-pane>
      <a-tab-pane key="day" :title="$t('Day')">
        <a-radio-group v-model="dayWeekdayData.checkedType" direction="vertical">
          <a-radio value="everyDay">每天</a-radio>
          <a-radio value="dayRange">
            <a-space>
              从每月第
              <a-input-number
                v-model="dayWeekdayData.dayRange.from"
                :min="1"
                :max="dayWeekdayData.dayRange.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="dayWeekdayData.weekdayRange.to"
                :min="dayWeekdayData.weekdayRange.from"
                :max="31"
                :precision="0"
                :step="1"
              />
              之间的每一天
            </a-space>
          </a-radio>
          <a-radio value="weekdayRange">
            <a-space>
              从每周
              <a-select v-model="dayWeekdayData.weekdayRange.from">
                <a-option
                  v-for="i in weekdays"
                  :key="i.value"
                  :disabled="i.value > dayWeekdayData.weekdayRange.to"
                  :label="i.label"
                  :value="i.value"
                />
              </a-select>
              到
              <a-select v-model="dayWeekdayData.weekdayRange.to">
                <a-option
                  v-for="i in weekdays"
                  :key="i.value"
                  :disabled="i.value < dayWeekdayData.weekdayRange.from"
                  :label="i.label"
                  :value="i.value"
                />
              </a-select>
              之间的每一天
            </a-space>
          </a-radio>
          <a-radio value="dayAverage">
            <a-space>
              从每月第
              <a-input-number
                v-model="dayWeekdayData.dayAverage.from"
                :min="1"
                :max="31"
                :precision="0"
                :step="1"
              />
              天开始每隔
              <a-input-number
                v-model="dayWeekdayData.dayAverage.step"
                :min="1"
                :max="31"
                :precision="0"
                :step="1"
              />
              天
            </a-space>
          </a-radio>
          <a-radio value="weekdayAverage">
            <a-space>
              从每周
              <a-select v-model="dayWeekdayData.weekdayAverage.from">
                <a-option v-for="i in weekdays" :key="i.value" :label="i.label" :value="i.value" />
              </a-select>
              开始每隔
              <a-input-number
                v-model="dayWeekdayData.weekdayAverage.step"
                :min="0"
                :max="7"
                :precision="0"
                :step="1"
              />
              天
            </a-space>
          </a-radio>
          <a-radio value="daySpecify">指定日期：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="dayWeekdayData.daySpecify" :options="days" />
          </div>
          <a-radio value="weekdaySpecify">指定星期：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="dayWeekdayData.weekdaySpecify" :options="weekdays" />
          </div>
          <a-radio value="lastWeekday">每月最后一个工作日</a-radio>
          <a-radio value="beforeEndSpacialDay">
            <a-space>
              每月倒数第
              <a-input-number
                v-model="dayWeekdayData.beforeEndSpacialDay"
                :min="1"
                :max="31"
                :precision="0"
                :step="1"
              />
              天
            </a-space>
          </a-radio>
          <a-radio value="lastSpecialWeekday">
            <a-space>
              每月最后一个
              <a-select v-model="dayWeekdayData.lastSpecialWeekday">
                <a-option v-for="i in weekdays" :key="i.value" :label="i.label" :value="i.value" />
              </a-select>
            </a-space>
          </a-radio>
          <a-radio value="nearestWeekdaySpecialDay">
            <a-space>
              每月离
              <a-input-number
                v-model="dayWeekdayData.nearestWeekdaySpecialDay"
                :min="1"
                :max="31"
                :precision="0"
                :step="1"
              />
              最近的工作日
            </a-space>
          </a-radio>
          <a-radio value="specialAWeekday">
            <a-space>
              每月第
              <a-input-number
                v-model="dayWeekdayData.specialAWeekday.idx"
                :min="1"
                :max="5"
                :precision="0"
                :step="1"
              />
              个
              <a-select v-model="dayWeekdayData.specialAWeekday.weekday">
                <a-option v-for="i in weekdays" :key="i.value" :label="i.label" :value="i.value" />
              </a-select>
            </a-space>
          </a-radio>
        </a-radio-group>
      </a-tab-pane>
      <a-tab-pane key="month" :title="$t('Month')">
        <a-radio-group v-model="monthData.checkedType" direction="vertical">
          <a-radio value="every">每月</a-radio>
          <a-radio value="range">
            <a-space>
              从
              <a-input-number
                v-model="monthData.range.from"
                :min="0"
                :max="monthData.range.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="monthData.range.to"
                :min="monthData.range.from"
                :max="12"
                :precision="0"
                :step="1"
              />
              之间的每一月
            </a-space>
          </a-radio>
          <a-radio value="average">
            <a-space>
              从第
              <a-input-number
                v-model="monthData.average.from"
                :min="0"
                :max="12"
                :precision="0"
                :step="1"
              />
              月开始每隔
              <a-input-number
                v-model="monthData.average.step"
                :min="1"
                :max="12"
                :precision="0"
                :step="1"
              />
              月
            </a-space>
          </a-radio>
          <a-radio value="specify"> 指定：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="monthData.specify" :options="months" />
          </div>
        </a-radio-group>
      </a-tab-pane>
      <a-tab-pane key="year" :title="$t('Year')">
        <a-radio-group v-model="yearData.checkedType" direction="vertical">
          <a-radio value="none">不指定</a-radio>
          <a-radio value="every">每年</a-radio>
          <a-radio value="range">
            <a-space>
              从
              <a-input-number
                v-model="yearData.range.from"
                :min="currentYear"
                :max="yearData.range.to"
                :precision="0"
                :step="1"
              />
              到
              <a-input-number
                v-model="yearData.range.to"
                :min="yearData.range.from"
                :precision="0"
                :step="1"
              />
              之间的每一年
            </a-space>
          </a-radio>
          <a-radio value="average">
            <a-space>
              从第
              <a-input-number
                v-model="yearData.average.from"
                :min="currentYear"
                :precision="0"
                :step="1"
              />
              年开始每隔
              <a-input-number
                v-model="yearData.average.step"
                :min="1"
                :max="100"
                :precision="0"
                :step="1"
              />
              年
            </a-space>
          </a-radio>
          <a-radio value="specify"> 指定：</a-radio>
          <div class="specify-options">
            <a-checkbox-group v-model="yearData.specify" :options="years" />
          </div>
        </a-radio-group>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<style lang="scss" scoped>
  .cron-preview-card {
    display: flex;
    flex-direction: column;
    .cron-card_header,
    .cron-card_expression {
      text-align: center;
      padding: 8px 24px;
      font-size: 1.4rem;
      font-weight: 500;
    }
    .cron-card_expression {
      background: rgb(240, 248, 255);
      border-radius: 2px;
    }
    .cron-card_exp-header,
    .cron-card_exp-content {
      padding: 8px 0;
      display: grid;
      gap: 4px;
      font-size: 1rem;
      grid-template-columns: repeat(7, 1fr);
    }
    .cron-card_exp-header {
      font-weight: 500;
      text-align: center;
      border-bottom: 2px solid var(--color-neutral-4);
    }
    .cron-card_exp-content {
      font-weight: 400;
      border-bottom: 1px solid var(--color-neutral-2);
    }
    .cron-card_exp-header span {
      cursor: pointer;
    }
  }
  .specify-options {
    box-sizing: border-box;
    padding-left: 22px;
    ::v-deep(.arco-checkbox-label) {
      font-family: Consolas, Monaco, monospace, sans-serif;
    }
  }
</style>
