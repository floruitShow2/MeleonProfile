<script setup lang="ts">
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ComponentTemplate' })

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)
  const getModule = inject(getModuleKey)

  const initElementState = () => {}

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="ComponentTemplate">
    <template #header><LucideIcon name="Bolt" />{{ $t('ComponentTemplate') }}</template>
    <EditItem :label="$t('')">
      <!--      -->
    </EditItem>
  </a-collapse-item>
</template>
