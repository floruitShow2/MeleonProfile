<script lang="ts" setup>
  import type Modeler from 'bpmn-js/lib/Modeler'
  import type CommandStack from 'diagram-js/lib/command/CommandStack'
  import { onUnmounted, ref } from 'vue'
  import emptyXML from '@/utils/empty-xml'
  import EventEmitter from '@/utils/EventEmitter'
  import { modelerKey } from '@/injection-keys'

  const modeler = inject(modelerKey)

  const undoEnable = ref(false)
  const redoEnable = ref(false)

  type EventType = 'Undo' | 'Redo' | 'Clear'

  const execWithCommand = (eventType: EventType, callback?: () => unknown) => {
    try {
      const commandStack = modeler!.value!.get<CommandStack>('commandStack')
      if (commandStack) {
        if (!commandStack[`can${eventType}`] || commandStack[`can${eventType}`]()) {
          commandStack[eventType.toLowerCase()] && commandStack[eventType.toLowerCase()]()
        }
        callback && callback()
        reloadBtnEnable(commandStack)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const createNewDiagram = () => {
    modeler!.value?.importXML(emptyXML(Date.now().toString()))
  }

  const reloadBtnEnable = (commandStack: CommandStack) => {
    undoEnable.value = commandStack.canUndo()
    redoEnable.value = commandStack.canRedo()
  }

  const undo = () => execWithCommand('Undo')

  const redo = () => execWithCommand('Redo')

  const clear = () => execWithCommand('Clear', createNewDiagram)

  const initCallback = (modeler: Modeler) => {
    const commandStack = modeler.get<CommandStack>('commandStack')
    reloadBtnEnable(commandStack)
    modeler.on('commandStack.changed', () => {
      reloadBtnEnable(commandStack)
    })
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
        {{ $t('undo') }}
      </template>
      <a-button :disabled="!undoEnable" @click="undo">
        <lucide-icon name="Undo2" />
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ $t('redo') }}
      </template>
      <a-button :disabled="!redoEnable" @click="redo">
        <lucide-icon name="Redo2" />
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        {{ $t('clear') }}
      </template>
      <a-button @click="clear">
        <lucide-icon name="Eraser" />
      </a-button>
    </a-popover>
  </a-button-group>
</template>
