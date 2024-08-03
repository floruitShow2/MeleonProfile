<script lang="ts" setup>
  import { modelerKey } from '@/injection-keys'

  const modeler = inject(modelerKey)

  const mockEnable = ref(false) // 默认关闭

  const toggleMock = () => {
    // @ts-expect-error
    modeler?.value?.get('toggleMode')?.toggleMode()
    mockEnable.value = !mockEnable.value
  }
</script>

<template>
  <a-popover>
    <template #content>
      {{ mockEnable ? $t('unableMock') : $t('enableMock') }}
    </template>
    <a-button type="primary" secondary @click="toggleMock">
      <LucideIcon name="CirclePlay" :size="16" />{{ $t('mockAs') }}
    </a-button>
  </a-popover>
</template>
