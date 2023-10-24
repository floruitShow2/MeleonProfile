<template>
  <a-config-provider :locale="locale">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <global-setting />
  </a-config-provider>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us'
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
  import GlobalSetting from '@/components/global-setting/index.vue'
  import useLocale from '@/hooks/locale'

  const { currentLocale } = useLocale()
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN
      case 'en-US':
        return enUS
      default:
        return enUS
    }
  })

  // const socket = new WebSocket('ws://localhost:3001')
  // socket.onopen = () => {
  //   socket.send('message')
  //   socket.onmessage = (data: unknown) => {
  //     console.log(data)
  //   }
  // }
  // socket.onerror = (error) => {
  //   console.log(error)
  // }
</script>
