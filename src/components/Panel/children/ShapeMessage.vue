<script setup lang="ts">
  import { currentElementKey, getModuleKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import {
    createElement,
    filterElementsByType,
    findRootElementById,
    getRoot,
    nextId
  } from '@/utils/element-utils'
  import { useI18n } from 'vue-i18n'
  import { getMessage, getMessageEventDefinition } from '@/utils/event-definition-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'

  defineOptions({ name: 'ShapeMessage' })

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const messageOptions = ref<OptionItem[]>([])
  const selectedMessageId = ref<string>()

  let allMessages: BpmnElement[] = []
  let root: BpmnRoot | undefined

  const getSelectedMessage = () => {
    const message = getMessage(currentElement!.value)
    selectedMessageId.value = message ? message.get('id') : ''
  }
  const getMessageOps = () => {
    // { value: '', name: t('None') },
    // { value: 'new', name: t('CreateNew') }
    let options: OptionItem[] = []
    root = getRoot(currentElement?.value?.businessObject)
    allMessages = filterElementsByType(root.get('rootElements'), 'bpmn:Message')
    messageOptions.value = options.concat(
      allMessages.map((el) => ({ name: el.name, value: el.id }))
    )
  }
  const updateMessage = (messageId) => {
    const commands: CommandContext[] = []
    const messageEventDefinition = getMessageEventDefinition(currentElement!.value)
    let message
    // (1) create new message
    if (messageId === 'new') {
      const id = nextId('Message')
      message = createElement(modeler!.value!, 'bpmn:Message', { id, name: id }, root)
      messageId = message.get('id')
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: currentElement!.value,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), message]
          }
        }
      })
    }

    // (2) update (or remove) messageRef
    message = message || findRootElementById(messageEventDefinition, 'bpmn:Message', messageId)

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element: currentElement!.value,
        moddleElement: messageEventDefinition,
        properties: {
          messageRef: message
        }
      }
    })

    execPanelMultiCommands(modeler!.value!, commands)

    selectedMessageId.value = messageId
  }

  useElementUpdateListener(() => {
    if (!currentElement?.value) {
      selectedMessageId.value = ''
      messageOptions.value = []
      return
    }
    getSelectedMessage()
    getMessageOps()
  })
</script>

<template>
  <a-collapse-item key="ShapeMessage">
    <template #header><LucideIcon name="Mail" />{{ $t('ShapeMessage') }}</template>
    <EditItem :label="$t('SelectMessage')">
      <a-select v-model="selectedMessageId" placeholder="请选择消息" @change="updateMessage">
        <a-option v-for="i in messageOptions" :key="i.value" :value="i.value">{{
          i.name
        }}</a-option>
      </a-select>
    </EditItem>
  </a-collapse-item>
</template>
