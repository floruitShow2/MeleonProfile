<script lang="ts" setup>
  import type Canvas from 'diagram-js/lib/core/Canvas'
  import type ZoomScroll from 'diagram-js/lib/navigation/zoomscroll/ZoomScroll'
  import type Modeler from 'bpmn-js/lib/Modeler'
  import { onUnmounted, ref } from 'vue'
  import EventEmitter from '@/utils/EventEmitter'
  import { modelerKey } from '@/injection-keys'
  import { setLocalStorage } from '@/utils/tools'

  const modeler = inject(modelerKey)

  const currentScale = ref(1)
  const mouseControlEnable = ref(true) // 默认鼠标控制开启
  const minimapEnable = ref(true) // 默认关闭小地图

  const zoomReset = (newScale: number | 'fit-viewport') => {
    const canvas = modeler!.value!.get<Canvas>('canvas')
    canvas && canvas.zoom(newScale, newScale === 'fit-viewport' ? undefined : { x: 0, y: 0 })
  }

  const zoomOut = (newScale?: number) => {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 - 0.1 * 100) / 100
    zoomReset(currentScale.value)
  }

  const zoomIn = (newScale?: number) => {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 + 0.1 * 100) / 100
    zoomReset(currentScale.value)
  }

  const toggleMouseControl = () => {
    modeler!.value!.get<ZoomScroll>('zoomScroll')?.toggle()
    mouseControlEnable.value = !mouseControlEnable.value
  }

  const toggleMinimap = () => {
    // @ts-expect-error
    modeler!.value!.get('minimap')?.toggle()
    minimapEnable.value = !minimapEnable.value
    setLocalStorage('minimap', { enabled: minimapEnable.value })
  }

  const initCallback = (modeler: Modeler) => {
    try {
      const canvas = modeler.get<Canvas>('canvas')
      const minimap = modeler.get<any>('minimap')
      currentScale.value = canvas?.zoom() || 1
      minimapEnable.value = minimap?.isOpen() || false
      modeler.on('canvas.viewbox.changed', ({ viewbox }: any) => {
        currentScale.value = (viewbox as any).scale || 1
      })
    } finally {
      currentScale.value = 1
    }
  }

  // 监听 modeler 实例化事件
  EventEmitter.on('modeler-init', initCallback)

  onUnmounted(() => {
    EventEmitter.removeListener('modeler-init', initCallback)
  })
</script>

<template>
  <a-button-group>
    <a-popover>
      <template #content>
        {{ $t('zoomOut') }}
      </template>
      <a-button @click="zoomOut()">
        <lucide-icon name="ZoomOut" />
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ $t('zoomReset') }}
      </template>
      <a-button @click="zoomReset('fit-viewport')">
        <span style="text-align: center; display: inline-block; width: 40px">
          {{ Math.floor(currentScale * 10) * 10 + '%' }}
        </span>
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ $t('zoomIn') }}
      </template>
      <a-button @click="zoomIn()">
        <lucide-icon name="ZoomIn" />
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ mouseControlEnable ? $t('unableMouseControl') : $t('enableMouseControl') }}
      </template>
      <a-button :class="{ 'is-unable': !mouseControlEnable }" @click="toggleMouseControl()">
        <lucide-icon name="Mouse" />
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ minimapEnable ? $t('unableMinimap') : $t('enableMinimap') }}
      </template>
      <a-button :class="{ 'is-unable': !minimapEnable }" @click="toggleMinimap()">
        <lucide-icon name="Map" />
      </a-button>
    </a-popover>
  </a-button-group>
</template>
