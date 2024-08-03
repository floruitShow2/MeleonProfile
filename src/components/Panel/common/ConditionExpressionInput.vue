<script setup lang="ts">
  import { PropType } from 'vue'
  import {
    getFormItemByFormCode,
    getFunctionVariableVos,
    getSequenceFlowVariableVos
  } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TreeInstance } from '@arco-design/web-vue'

  defineOptions({ name: 'ConditionExpressionInput' })

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    modalTitle: {
      type: String as PropType<string>,
      default: ''
    },
    processId: {
      type: String as PropType<string>,
      default: ''
    }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const computedValue = computed({
    get: () => {
      const matches = $props.value.match(pattern)
      return matches?.[0]?.slice(2, -1) || ''
    },
    set: (value) => {
      const val = value.trim()
      if (val === '') {
        $emits('update:value', val)
        $emits('change', val)
        return
      }
      const exp = '${' + val + '}'
      $emits('update:value', exp)
      $emits('change', exp)
    }
  })
  // 复制一个值用来处理弹窗内部的内容，避免多次更新 xml
  const modalValue = ref('')

  const pattern = /\${(.*?)}/g

  const modalVisible = ref(false)
  const loading = ref(false)

  const formVariables = ref<any[]>([])
  const flowVariables = ref<any[]>([])
  const funcVariables = ref<any[]>([])
  const orgTreeRef = ref<InitRef<TreeInstance>>()
  const computedTreeData = computed(() => {
    return [
      {
        name: '表单变量',
        id: 'form',
        children: formVariables.value
      },
      {
        name: '基础变量',
        id: 'flow',
        children: flowVariables.value
      },
      {
        name: '函数变量',
        id: 'func',
        children: funcVariables.value
      }
    ]
  })

  const operatorList = [
    { label: '1', value: '1', name: '1' },
    { label: '2', value: '2', name: '2' },
    { label: '3', value: '3', name: '3' },
    { label: '+', value: '+', name: '加' },
    { label: '4', value: '4', name: '4' },
    { label: '5', value: '5', name: '5' },
    { label: '6', value: '6', name: '6' },
    { label: '-', value: '-', name: '减' },
    { label: '7', value: '7', name: '7' },
    { label: '8', value: '8', name: '8' },
    { label: '9', value: '9', name: '9' },
    { label: '*', value: '*', name: '乘' },
    { label: '0', value: '0', name: '0' },
    { label: '.', value: '.', name: '小数点' },
    { label: '%', value: '%', name: '余' },
    { label: '/', value: '/', name: '除' }
  ]
  const logicList = [
    { label: '(', value: '(', name: '左括号' },
    { label: ')', value: ')', name: '右括号' },
    { label: '且', value: '&&', name: '且' },
    { label: '或', value: '||', name: '或' },
    { label: '小于', value: '<', name: '小于' },
    { label: '大于', value: '>', name: '大于' },
    { label: '等于', value: '==', name: '等于' },
    { label: '不等于', value: '!=', name: '不等于' },
    { label: '小于等于', value: '<=', name: '小于等于' },
    { label: '大于等于', value: '>=', name: '大于等于' },
    { label: ';', value: ';', name: ';' },
    { label: ',', value: ',', name: ',' },
    { label: '!', value: '!', name: '!' }
  ]

  const getFormVariables = async () => {
    try {
      const { data = [] } = await getFormItemByFormCode({ formType: 0, formCode: $props.processId })
      data.forEach((i) => {
        i.name = i.labelName
        i.id = 'form.' + i.makKey
      })
      formVariables.value = data
    } catch (e) {
      formVariables.value = []
    }
  }
  const getFlowVariables = async () => {
    try {
      const { data = [] } = await getSequenceFlowVariableVos()
      flowVariables.value = data
    } catch (e) {
      flowVariables.value = []
    }
  }
  const getFuncVariables = async () => {
    try {
      const { data = [] } = await getFunctionVariableVos()
      funcVariables.value = data
    } catch (e) {
      funcVariables.value = []
    }
  }

  const updateSelectVariable = (_, { node }) => {
    if (node.children && node.children.length) return
    addExpressionElement(node.id)
  }
  const addExpressionElement = (el: string) => {
    modalValue.value += ` ${el}`
  }

  const openModal = async () => {
    try {
      modalVisible.value = true
      modalValue.value = computedValue.value
      const requestList: Function[] = []
      if (!formVariables.value.length) requestList.push(getFormVariables)
      if (!flowVariables.value.length) requestList.push(getFlowVariables)
      if (!funcVariables.value.length) requestList.push(getFuncVariables)
      if (requestList.length) loading.value = true
      await Promise.all(requestList.map((f) => f()))
      await nextTick()
      orgTreeRef.value?.expandAll(true)
    } finally {
      loading.value = false
    }
  }
  const updateComputedValue = () => {
    computedValue.value = modalValue.value
  }
</script>

<template>
  <div class="variable-title-input">
    <div class="exp-textarea-input">
      <div class="exp-input_prefix">
        <span>${</span>
      </div>
      <a-textarea v-model="computedValue" :autosize="{ minRows: 2, maxRows: 4 }" />
      <div class="exp-input_append">
        <span>}</span>
      </div>
    </div>
    <a-button type="outline" style="height: auto" @click="openModal">
      <LucideIcon name="Plus" />
    </a-button>
  </div>
  <a-drawer
    v-model:visible="modalVisible"
    width="1160px"
    :title="modalTitle"
    @ok="updateComputedValue"
  >
    <a-spin
      :loading="loading"
      style="width: 100%; height: calc(100vh - 142px); overflow: hidden; box-sizing: border-box"
    >
      <div class="tag-input-flex">
        <div class="header-tags">
          <div class="exp-textarea-input">
            <div class="exp-input_prefix">
              <span>${</span>
            </div>
            <a-textarea v-model="modalValue" :autosize="{ minRows: 2, maxRows: 4 }" />
            <div class="exp-input_append">
              <span>}</span>
            </div>
          </div>
        </div>
        <div class="tag-input-special-grid">
          <div class="left-org-tree">
            <div class="tree-content">
              <a-tree
                ref="orgTreeRef"
                :data="computedTreeData"
                :field-names="{ title: 'name', key: 'id' }"
                block-node
                default-expand-all
                @select="updateSelectVariable"
              />
            </div>
          </div>
          <div class="right-table use-grid">
            <div class="operator-list use-grid">
              <a-button
                v-for="op in operatorList"
                :key="op.value"
                type="outline"
                @click="addExpressionElement(op.value)"
                >{{ op.label }}</a-button
              >
            </div>
            <div class="logic-list use-grid">
              <a-button
                v-for="lg in logicList"
                :key="lg.value"
                type="outline"
                status="success"
                @click="addExpressionElement(lg.value)"
                >{{ lg.label }}</a-button
              >
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<style scoped lang="scss">
  .right-table.use-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .operator-list.use-grid,
  .logic-list.use-grid {
    height: min-content;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px 12px;
  }

  .exp-textarea-input {
    width: 100%;
    display: flex;
    overflow: hidden;
    .exp-input_prefix,
    .exp-input_append {
      color: var(--color-text-1);
      background-color: var(--color-neutral-2);
      padding: 0 8px;
      display: flex;
      align-items: center;
    }
  }
</style>
