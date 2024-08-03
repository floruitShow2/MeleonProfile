<script setup lang="ts">
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'CamelServiceTask' })

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  const initElementState = () => {}

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="CamelServiceTask">
    <template #header>
      <BpmnIcon name="camel-service-task" :size="16" />
      {{ $t('CamelServiceTask') }}
    </template>
    <EditItem :label="$t('')">
      <!--      -->
    </EditItem>
  </a-collapse-item>
</template>
