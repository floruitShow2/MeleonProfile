<script setup lang="ts">
  import { currentElementKey, modelerKey } from '@/injection-keys'
  import useElementUpdateListener from '@/hooks/useElementUpdateListener'
  import { useI18n } from 'vue-i18n'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import { debounce } from '@/utils/debounce'
  import { updateModdleProp } from '@/utils/modeling'
  import { InitRef } from '@/components/Panel/common/types'
  import FormTagInput from '@/components/Panel/common/FormTagInput.vue'
  import {
    generateAddExtensionCommand,
    getExExtensionElementsList
  } from '@/utils/extension-elements-utils'
  import { createExElement } from '@/utils/element-utils'
  import { execPanelMultiCommands } from '@/utils/commandsExecute'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import {
    getFormItemByFormCode,
    getFormItemShowsByActivityId,
    saveNodeFormPermission
  } from '@/api/bpmn'
  import { ref } from 'vue'

  defineOptions({ name: 'NodeForm' })
  const labelWidth = 80

  const { t } = useI18n()
  const currentElement = inject(currentElementKey)
  const modeler = inject(modelerKey)

  const getElementAndModeling = () => {
    const element = currentElement!.value
    const bo = element?.businessObject
    const modeling = modeler!.value!.get<Modeling>('modeling')
    return { element, modeling, bo }
  }
  const updateCommonProp = debounce({ delay: 0, trailing: true }, (key: string, value: unknown) => {
    const { element, modeling } = getElementAndModeling()
    updateModdleProp(modeling, element, element.businessObject, key, value)
  })

  const formType = ref<InitRef<number>>()
  const selectForm = ref<InitRef<string>>()
  const onLoading = ref(false)

  const formKey = ref<InitRef<string>>()
  const processId = ref<InitRef<string>>()
  const nodeFormExp = ref<InitRef<any[]>>()
  const permissionColumns = [
    { title: t('FieldName'), ellipsis: true, tooltip: true, dataIndex: 'labelName' },
    { title: t('Operation'), width: 268, slotName: 'operation' }
  ]
  const formItemList = ref<any[]>([])
  const formItemShowList = ref<any[]>([])

  const toggleFormType = async (selectForm) => {
    if (selectForm === 'custom') {
      formKey.value = ''
      formItemList.value = []
      formItemShowList.value = []
      nodeFormExp.value = []
      await getFormItems(0, processId.value!)
      await getFormItemShows({
        activityId: currentElement!.value?.id,
        formCode: processId.value,
        modelKey: processId.value
      })
    } else {
      await initElementState()
    }
  }
  const updateTaskFormKey = debounce({ delay: 0, trailing: true }, (value: string) => {
    updateTaskForm(null, value)
  })
  const updateTaskFormBinding = (formData: any[]) => {
    updateTaskForm(formData)
  }
  const updateTaskForm = (formData: any[] | null, key?: string) => {
    const { element, bo } = getElementAndModeling()
    const formKey = formData ? formData[0]?.code : key
    const body = JSON.stringify(formData || [])
    const nodeFormExpEl = getExExtensionElementsList(bo, 'NodeFormExp')?.[0]
    const commands: CommandContext[] = [
      {
        cmd: 'element.updateModdleProperties',
        context: { element, moddleElement: bo, properties: { formKey } }
      }
    ]
    if (nodeFormExpEl) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: { element, moddleElement: nodeFormExpEl, properties: { body } }
      })
    } else {
      commands.push(
        ...generateAddExtensionCommand(
          modeler!.value!,
          element,
          bo,
          createExElement(modeler!.value!, 'NodeFormExp', { body })
        )
      )
    }
    execPanelMultiCommands(modeler!.value!, commands)

    // 元素更新会自动触发更新
    // if (form?.code) {
    //   getFormItems(2, form.code)
    // } else {
    //   getFormItems(0, processId.value!)
    // }
  }

  const getFormItemShows = async (params: any) => {
    try {
      onLoading.value = true
      const { data = [] } = await getFormItemShowsByActivityId(params)
      formItemShowList.value = data.map((i) => ({ ...i }))
    } catch (e) {
      console.error(e)
      formItemShowList.value = []
    } finally {
      onLoading.value = false
    }
  }
  const getFormItems = async (formType: number, formCode: string) => {
    try {
      onLoading.value = true
      const { data = [] } = await getFormItemByFormCode({ formType: formType, formCode: formCode })
      formItemList.value = data.map((i) => ({ ...i, operateType: 1 }))
    } catch (e) {
      console.error(e)
      formItemList.value = []
    } finally {
      onLoading.value = false
    }
  }
  /**
   * 合并数据
   */
  const getFormPermissions = async () => {
    try {
      onLoading.value = true
      const formItemOpMap = formItemShowList.value.reduce((acc, cur) => {
        acc[cur.makKey] = cur.operateType
        return acc
      }, {})
      formItemList.value.forEach((i) => {
        i.operateType = formItemOpMap[i.makKey] || 1
      })
    } catch (e) {
      console.error(e)
      // formItemList.value = []
    } finally {
      onLoading.value = false
    }
  }
  const updateFormItemPermission = async (item) => {
    try {
      onLoading.value = true
      await saveNodeFormPermission(item)
    } catch (e) {
      console.error(e)
    } finally {
      onLoading.value = false
    }
  }

  const initElementState = async () => {
    try {
      const formCode = ref<InitRef<string>>()
      resetFormState()
      selectForm.value = 'choose'
      const element = currentElement?.value
      const bo = element?.businessObject
      if (!bo) return
      const root = modeler!.value!.get<Canvas>('canvas').getRootElement()
      if (is(root, 'bpmn:Collaboration')) {
        processId.value = root.children[0].businessObject.processRef.id
      } else {
        processId.value = root['id']
      }
      formKey.value = bo.get('formKey')
      const nodeFormExpEl = getExExtensionElementsList(bo, 'NodeFormExp')?.[0]
      if (nodeFormExpEl) {
        nodeFormExp.value = JSON.parse(nodeFormExpEl.get('body') || '[]')
      } else {
        nodeFormExp.value = []
      }
      /**
       * 如果 formKey 存在说明是任务表单，否则显示流程主表单
       */
      if (formKey.value) {
        formType.value = 2
        formCode.value = formKey.value
      } else {
        formType.value = 0
        formCode.value = processId.value
      }
      onLoading.value = true
      //查询当前的节点表单的FormItem
      await getFormItems(formType.value, formCode.value!)
      //查询保存的表单formItem信息
      await getFormItemShows({
        activityId: currentElement!.value?.id,
        formCode: formCode.value,
        modelKey: processId.value
      })
      if (formItemList.value.length) {
        await getFormPermissions()
      } else {
        selectForm.value = 'custom'
      }
    } finally {
      onLoading.value = false
    }
  }
  const resetFormState = () => {
    nodeFormExp.value = formKey.value = undefined
  }

  useElementUpdateListener(initElementState)
</script>

<template>
  <a-collapse-item key="NodeForm">
    <template #header>
      <LucideIcon name="BookText" />{{ $t('NodeForm') }}
      <a-tag v-if="formKey" color="blue"><LucideIcon name="Pointer" /></a-tag>
    </template>

    <edit-item :label-width="labelWidth" :label="$t('FormKey')">
      <a-radio-group v-model="selectForm" type="button" @change="toggleFormType">
        <a-radio value="choose">{{ $t('ChooseForm') }}</a-radio>
        <a-radio value="custom">{{ $t('Custom') }}</a-radio>
      </a-radio-group>
    </edit-item>

    <edit-item :label-width="labelWidth" :prefix="false">
      <a-input
        v-if="selectForm === 'custom'"
        v-model="formKey"
        placeholder="请输入表单Code"
        @change="updateTaskFormKey"
      />
      <FormTagInput v-else v-model:data="nodeFormExp" @change="updateTaskFormBinding" />
    </edit-item>

    <a-divider>
      <LucideIcon name="LibraryBig" /><span>{{ $t('FormPermissions') }}</span>
    </a-divider>

    <a-spin :loading="onLoading">
      <a-table
        :columns="permissionColumns"
        :data="formItemList"
        :scroll="{ y: 240 }"
        :pagination="false"
      >
        <template #operation="{ record }">
          <a-radio-group
            v-model="record.operateType"
            type="button"
            size="mini"
            @change="updateFormItemPermission(record)"
          >
            <a-radio :value="3">{{ $t('Required') }}</a-radio>
            <a-radio :value="2">{{ $t('CanEdit') }}</a-radio>
            <a-radio :value="1">{{ $t('OnlyVisible') }}</a-radio>
            <a-radio :value="0">{{ $t('Hidden') }}</a-radio>
          </a-radio-group>
        </template>
      </a-table>
    </a-spin>
  </a-collapse-item>
</template>
