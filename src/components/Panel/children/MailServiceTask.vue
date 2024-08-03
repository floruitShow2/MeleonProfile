<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { InitRef } from '@/components/Panel/common/types'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import {
    addExtensionElements,
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { updateModdleProp, updateModdleProps } from '@/utils/modeling'
  import { createExElement } from '@/utils/element-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import { ComponentInstance } from 'vue'
  import FulltextInput from '@/components/Panel/common/FulltextInput.vue'

  defineOptions({ name: 'MailServiceTask' })
  const labelWidth = ref(80)

  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const bpmnModeler = modeler!.value!
    const modeling = bpmnModeler.get<Modeling>('modeling')
    return { element, modeling, bpmnModeler }
  }
  const updateFieldElement = debounce(
    { delay: 0, trailing: true },
    (name: string, value?: string) => {
      const { element, modeling, bpmnModeler } = getElementAndModeling()
      const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
      const fieldEE = fieldEEs.filter((ex) => ex.name === name)[0]
      const propName = name === 'subject' ? 'string' : 'expression'
      if (fieldEE) {
        if (name === 'saveResponseParameters' && value === 'false') {
          return updateModdleProps(modeling, element, fieldEE, {
            [propName]: value,
            responseVariableName: undefined
          })
        }
        updateModdleProp(modeling, element, fieldEE, propName, value)
      } else {
        addExtensionElements(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name,
            [propName]: value
          })
        )
      }
    }
  )

  const to = ref<InitRef<string>>()
  const idmCandidateUsers = ref<Record<string, any>[]>([])
  const subject = ref<InitRef<string>>()
  const html = ref<InitRef<string>>()

  const editor = shallowRef<InitRef<ComponentInstance<typeof FulltextInput>>>()

  const updateMailSubject = debounce({ delay: 0, trailing: true }, () =>
    updateFieldElement('subject', subject.value)
  )
  const updateMailHtml = debounce({ delay: 0, trailing: true }, (html) => {
    const commands: CommandContext[] = []
    const { element, bpmnModeler } = getElementAndModeling()
    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const fieldHtml = fieldEEs.filter((ex) => ex.name === 'html')[0]
    const fieldCharset = fieldEEs.filter((ex) => ex.name === 'charset')[0]
    if (fieldHtml) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: fieldHtml,
          properties: { expression: html }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'html',
            expression: html
          })
        )
      )
    }
    if (!fieldCharset) {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'charset',
            string: 'utf-8'
          })
        )
      )
    }
    execPanelMultiCommands(bpmnModeler, commands)
  })
  const updateMailToUser = () => {
    const commands: CommandContext[] = []
    const { element, bpmnModeler } = getElementAndModeling()

    const fieldEEs = getExExtensionElementsList(element!.businessObject, 'Field')
    const toMailToUsers = fieldEEs.filter((ex) => ex.name === 'to')[0]
    const to = idmCandidateUsers.value.map((i) => i.email).join(',')
    if (toMailToUsers) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: toMailToUsers,
          properties: { string: to }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'Field', {
            name: 'to',
            expression: to
          })
        )
      )
    }

    const userExtensionElement = getExExtensionElementsList(
      element!.businessObject,
      'IdmCandidateUsers'
    )?.[0]
    if (userExtensionElement) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: userExtensionElement,
          properties: { body: JSON.stringify(idmCandidateUsers.value) }
        }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          bpmnModeler,
          element,
          element!.businessObject,
          createExElement(bpmnModeler, 'IdmCandidateUsers', {
            body: JSON.stringify(idmCandidateUsers.value)
          })
        )
      )
    }

    execPanelMultiCommands(bpmnModeler, commands)
  }

  const initElementState = () => {
    resetFormState()
    const element = currentElement?.value
    const bo = element?.businessObject
    if (!bo) return
    const extensionElements = getExExtensionElementsList(bo, 'Field')
    for (const exEl of extensionElements) {
      switch (exEl.name) {
        case 'to':
          to.value = exEl.get('expression')
          break
        case 'subject':
          subject.value = exEl.get('string')
          break
        case 'html':
          html.value = exEl.get('expression')
          html.value && editor.value?.setHTML(html.value)
          break
      }
    }

    const UserExtensionElement = getExExtensionElementsList(bo, 'IdmCandidateUsers')?.[0]
    if (UserExtensionElement) {
      idmCandidateUsers.value = JSON.parse(UserExtensionElement.get('body') || '[]')
    }
  }
  const resetFormState = () => {
    to.value = subject.value = html.value = undefined
    idmCandidateUsers.value = []
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="MailServiceTask">
    <template #header>
      <BpmnIcon name="mail-service-task" :size="16" />
      {{ $t('MailServiceTask') }}
    </template>
    <EditItem :label-width="labelWidth" :label="$t('MailTo')">
      <UserTagInput v-model:data="idmCandidateUsers" @change="updateMailToUser" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('MailSubject')">
      <a-input v-model="subject" placeholder="请输入标题" @input="updateMailSubject" />
    </EditItem>
    <EditItem :label-width="labelWidth" :label="$t('MailHtml')">
      <!--      <a-textarea-->
      <!--        v-model="html"-->
      <!--        :auto-size="{ minRows: 4, maxRows: 8 }"-->
      <!--        @input="updateMailHtml"-->
      <!--        @change="updateMailHtml"-->
      <!--      />-->
      <FulltextInput ref="editor" v-model:content="html" @change="updateMailHtml" />
    </EditItem>
  </a-collapse-item>
</template>
