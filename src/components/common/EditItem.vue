<script lang="ts" setup>
  import { computed, PropType } from 'vue'

  defineOptions({ name: 'EditItem' })

  const props = defineProps({
    label: {
      type: String as PropType<string>,
      default: ''
    },
    description: {
      type: String as PropType<string>,
      default: ''
    },
    align: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    prefix: {
      type: [String, Boolean] as PropType<string | boolean>,
      default: '：'
    },
    textAlign: {
      type: String as PropType<string>,
      default: 'right',
      validator: (val: string) => ['left', 'center', 'right'].includes(val)
    },
    labelWidth: {
      type: [Number, String] as PropType<number | string>,
      default: 120
    }
  })

  const computedStyles = computed(() => {
    return {
      '--label-width':
        typeof props.labelWidth === 'string' ? props.labelWidth : `${props.labelWidth}px`,
      '--text-align': props.textAlign as 'center',
      '--el-align': props.align === 'vertical' ? 'column' : 'row'
    }
  })

  const computedLabel = computed(() => {
    if (!props.prefix) return props.label
    return typeof props.prefix === 'string' ? `${props.label}${props.prefix}` : `${props.label}：`
  })
</script>

<template>
  <div class="edit-item" :style="computedStyles">
    <div class="edit-item_label">{{ computedLabel }}</div>
    <div class="edit-item_content">
      <div class="edit-item_form-item">
        <slot></slot>
      </div>
      <div v-if="!!description || $slots.description" class="edit-item_description">
        <span v-if="description">{{ description }}</span>
        <slot name="description" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .edit-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    line-height: 34px;
    flex-direction: var(--el-align);
    .edit-item_label {
      width: var(--label-width);
      text-align: var(--text-align);
      flex-shrink: 0;
    }
    .edit-item_content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .edit-item_description {
      font-size: 12px;
      color: #767c82;
      line-height: 16px;
      padding-top: 8px;
    }

    & + .edit-item {
      margin-top: 12px;
    }
  }
</style>
