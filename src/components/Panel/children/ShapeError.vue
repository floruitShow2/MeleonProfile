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
  import { getError, getErrorEventDefinition } from '@/utils/event-definition-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'

  defineOptions({ name: 'ShapeError' })

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const errorOptions = ref<OptionItem[]>([])
  const selectedErrorId = ref<string>()

  let allErrors: BpmnElement[] = []
  let root: BpmnRoot | undefined

  const getSelectedError = () => {
    const error = getError(currentElement!.value)
    selectedErrorId.value = error ? error.get('id') : ''
  }
  const getErrorOps = () => {
    // { value: '', name: t('None') },
    // { value: 'new', name: t('CreateNew') }
    // let options: OptionItem[] = []
    root = getRoot(currentElement?.value?.businessObject)
    allErrors = filterElementsByType(root.get('rootElements'), 'bpmn:Error')
    errorOptions.value = allErrors.map((el) => ({ name: el.name, value: el.id }))
  }
  const updateError = (errorId) => {
    const commands: CommandContext[] = []
    const errorEventDefinition = getErrorEventDefinition(currentElement!.value)
    let error
    // (1) create new error
    if (errorId === 'new') {
      const id = nextId('Error')
      error = createElement(modeler!.value!, 'bpmn:Error', { id, name: id }, root)
      errorId = error.get('id')
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: currentElement!.value,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), error]
          }
        }
      })
    }

    // (2) update (or remove) errorRef
    error = error || findRootElementById(errorEventDefinition, 'bpmn:Error', errorId)

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element: currentElement!.value,
        moddleElement: errorEventDefinition,
        properties: {
          errorRef: error
        }
      }
    })

    execPanelMultiCommands(modeler!.value!, commands)

    selectedErrorId.value = errorId
  }

  useElementUpdateListener(() => {
    if (!currentElement?.value) {
      selectedErrorId.value = ''
      errorOptions.value = []
      return
    }
    getSelectedError()
    getErrorOps()
  })
</script>

<template>
  <a-collapse-item key="ShapeError">
    <template #header>
      <!-- 错误标识特殊处理 -->
      <LucideIcon name="Zap" style="transform: rotateY(180deg) rotate(90deg)" />{{
        $t('ShapeError')
      }}
    </template>
    <EditItem :label="$t('SelectError')">
      <a-select v-model="selectedErrorId" placeholder="请选择错误"  @change="updateError">
        <a-option v-for="i in errorOptions" :key="i.value" :value="i.value">{{ i.name }}</a-option>
      </a-select>
    </EditItem>
  </a-collapse-item>
</template>
