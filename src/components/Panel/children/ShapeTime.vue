<script setup lang="ts">
  import TimerForm from '@/components/Panel/common/TimerForm.vue'
  defineOptions({ name: 'ShapeTime' })
</script>

<template>
  <a-collapse-item key="ShapeTime">
    <template #header><LucideIcon name="Clock" />{{ $t('ShapeTime') }}</template>
    <TimerForm />
  </a-collapse-item>
</template>
