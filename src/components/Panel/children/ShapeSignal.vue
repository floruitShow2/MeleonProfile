<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import {
    createElement,
    filterElementsByType,
    findRootElementById,
    getRoot,
    nextId
  } from '@/utils/element-utils'
  import { getSignal, getSignalEventDefinition } from '@/utils/event-definition-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'

  defineOptions({ name: 'ShapeSignal' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const signalOptions = ref<OptionItem[]>([])
  const selectedSignalId = ref<string>()

  let allSignals: BpmnElement[] = []
  let root: BpmnRoot | undefined

  const getSelectedSignal = () => {
    const signal = getSignal(currentElement!.value)
    selectedSignalId.value = signal ? signal.get('id') : ''
  }
  const getSignalOps = () => {
    root = getRoot(currentElement?.value?.businessObject)
    allSignals = filterElementsByType(root.get('rootElements'), 'bpmn:Signal')
    signalOptions.value = allSignals.map((el) => ({ name: el.name, value: el.id }))
  }
  const updateSignal = (signalId) => {
    const commands: CommandContext[] = []
    const signalEventDefinition = getSignalEventDefinition(currentElement!.value)
    let signal
    // (1) create new signal
    if (signalId === 'new') {
      const id = nextId('Signal')
      signal = createElement(modeler!.value!, 'bpmn:Signal', { id, name: id }, root)
      signalId = signal.get('id')
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: currentElement!.value,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), signal]
          }
        }
      })
    }

    // (2) update (or remove) signalRef
    signal = signal || findRootElementById(signalEventDefinition, 'bpmn:Signal', signalId)

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element: currentElement!.value,
        moddleElement: signalEventDefinition,
        properties: {
          signalRef: signal
        }
      }
    })

    execPanelMultiCommands(modeler!.value!, commands)

    selectedSignalId.value = signalId
  }

  useElementUpdateListener(() => {
    if (!currentElement?.value) {
      selectedSignalId.value = ''
      signalOptions.value = []
      return
    }
    getSelectedSignal()
    getSignalOps()
  })
</script>

<template>
  <a-collapse-item key="ShapeSignal">
    <template #header><LucideIcon name="Triangle" />{{ $t('ShapeSignal') }}</template>
    <EditItem :label="$t('SelectSignal')">
      <a-select v-model="selectedSignalId" placeholder="请选择信号"  @change="updateSignal">
        <a-option v-for="i in signalOptions" :key="i.value" :value="i.value">{{ i.name }}</a-option>
      </a-select>
    </EditItem>
  </a-collapse-item>
</template>
