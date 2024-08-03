<script lang="ts" setup>
  import { computed, ComputedRef } from 'vue'
  import { useI18n } from 'vue-i18n'
  import LucideIcon from '@/components/common/LucideIcon.vue'
  import { modelerKey } from '@/injection-keys'
  import { Message } from '@arco-design/web-vue'

  const modeler = inject(modelerKey)

  const { t } = useI18n()
  const buttons: ComputedRef<{ name: string; key: string; icon: string }[]> = computed(() => {
    return [
      { name: t('alignLeft'), key: 'left', icon: 'AlignStartVertical' },
      { name: t('alignCenter'), key: 'center', icon: 'AlignCenterVertical' },
      { name: t('alignRight'), key: 'right', icon: 'AlignEndVertical' },
      { name: t('alignTop'), key: 'top', icon: 'AlignStartHorizontal' },
      { name: t('alignMiddle'), key: 'middle', icon: 'AlignCenterHorizontal' },
      { name: t('alignBottom'), key: 'bottom', icon: 'AlignEndHorizontal' }
    ]
  })

  const alignElements = (tag: string) => {
    const modeling = modeler!.value!.get('modeling')
    const selection: any = modeler!.value!.get('selection')
    const align: any = modeler!.value!.get('alignElements')
    if (modeling && selection) {
      const SelectedElements = selection.get()
      if (!SelectedElements || SelectedElements.length <= 1) {
        return Message.warning('请按住 Shift 键选择多个元素对齐')
      }
      align.trigger(SelectedElements, tag)
    }
  }

  // const externalFunction = () => {
  //   const modeler = getModeler()
  //   if (modeler) {
  //     modeler.saveXML().then(async ({ xml }) => {
  //       if (xml) {
  //         const newXML = await layoutProcess(xml)
  //         await modeler.importXML(newXML)
  //       }
  //     })
  //   }
  // }
</script>

<template>
  <a-button-group>
    <a-popover v-for="btn in buttons" :key="btn.key">
      <template #content>
        {{ btn.name }}
      </template>

      <a-button @click="alignElements(btn.key)">
        <lucide-icon :name="btn.icon" />
      </a-button>
    </a-popover>

    <!--    <a-popover>-->
    <!--      <a-button @click="externalFunction">-->
    <!--        <lucide-icon name="Command" />-->
    <!--      </a-button>-->
    <!--      <template #content>-->
    <!--        {{ $t('alignAuto') }}-->
    <!--      </template>-->
    <!--    </a-popover>-->
  </a-button-group>
</template>
