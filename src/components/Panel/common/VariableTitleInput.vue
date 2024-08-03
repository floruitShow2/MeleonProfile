<script setup lang="ts">
  import { PropType } from 'vue'
  import { getFormItemByFormCode, getProcessNameBaseInfos } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TreeInstance } from '@arco-design/web-vue'
  import { treeDataTranslate } from '@/utils/ApiUtils'
  import type { Listener } from '@/helpers/listener-helpers'

  defineOptions({ name: 'VariableTitleInput' })

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    processId: {
      type: String as PropType<string>,
      default: ''
    },
    confirm: {
      type: Function as PropType<(exp: string) => Promise<boolean>>,
      default: () => Promise.resolve(true)
    }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const pattern = /{(.*?)}/g

  const modalVisible = ref(false)
  const loading = ref(false)
  const activeIdx = ref(0)
  const formItems = ref<any[]>([])
  const formItemNameMap = ref<Record<string, string>>({})
  const infoItems = ref<any[]>([])
  const infoItemNameMap = ref<Record<string, string>>({})
  const infoTreeRef = ref<InitRef<TreeInstance>>()

  const modalCheckedValues = ref<any[]>([])

  const getFieldData = async () => {
    try {
      const { data: formData } = await getFormItemByFormCode({
        formType: 0,
        formCode: $props.processId
      })
      formItems.value = formData
      formItemNameMap.value = formData.reduce((acc: any, item: any) => {
        item.value = `form.${item.makModel}`
        return (acc[item.value] = item.labelName) && acc
      }, {})

      const { data: infoData } = await getProcessNameBaseInfos()

      infoItems.value = treeDataTranslate(infoData, 'id', 'pid')
      infoItemNameMap.value = infoData.reduce((acc: any, item: any) => {
        return (acc[item.sn] = item.name) && acc
      }, {})

      await nextTick()

      infoTreeRef.value?.expandAll(true)
    } catch (e) {
      formItems.value = []
      infoItems.value = []
      console.error(e)
    }
  }

  const changeSelectCustomItem = () => {
    modalCheckedValues.value.splice(activeIdx.value, 0, { value: '', isInput: true })
    activeIdx.value += 1
  }
  const changeSelectFormItem = (item) => {
    modalCheckedValues.value.splice(activeIdx.value, 0, { value: item.value })
    activeIdx.value += 1
  }
  const changeSelectInfoItem = (_, { node }: any) => {
    if (node.status === '2' || (node.children && node.children.length)) return
    modalCheckedValues.value.splice(activeIdx.value, 0, { value: node.sn })
    activeIdx.value += 1
  }

  const openModal = async () => {
    loading.value = true
    modalVisible.value = true
    await getFieldData()
    loading.value = false
  }
  const updateModalValues = async () => {
    const nameExp = modalCheckedValues.value.reduce((acc: any, item: any) => {
      if (item.isInput) {
        acc += item.value
      } else {
        acc += `\${${item.value}}`
      }
      return acc
    }, '')
    $emits('update:value', nameExp)
    $emits('change', nameExp)

    return await $props.confirm(nameExp)
  }

  // 键盘快捷键
  const handleKeydown = (e: KeyboardEvent) => {
    // if (document.activeElement !== document.body) return
    if (document.activeElement?.tagName.toLowerCase() === 'input') return
    switch (e.code.toLocaleLowerCase()) {
      case 'keyi':
        changeSelectCustomItem()
        break
      case 'delete':
        handleDeleteOperator(false)
        break
      case 'backspace':
        handleDeleteOperator(true)
        break
      case 'arrowleft':
        handleMoveCursor(-1)
        break
      case 'arrowright':
        handleMoveCursor(1)
        break
    }
  }
  const handleMoveCursor = (num: number) => {
    activeIdx.value += num
    if (activeIdx.value > modalCheckedValues.value.length) {
      activeIdx.value = modalCheckedValues.value.length
    } else if (activeIdx.value < 0) {
      activeIdx.value = 0
    }
  }
  const handleDeleteOperator = (flag?: boolean) => {
    flag && (activeIdx.value -= 1)
    modalCheckedValues.value.splice(activeIdx.value, 1)
    if (activeIdx.value < 0) {
      activeIdx.value = 0
    }
  }

  watch(
    () => modalVisible.value,
    (value) => {
      value
        ? document.addEventListener('keydown', handleKeydown)
        : document.removeEventListener('keydown', handleKeydown)
    }
  )

  watch(
    () => $props.value,
    (value) => {
      //
      const values: any[] = []
      const items = value ? value.split('$') : []

      items.forEach((item) => {
        if (!item.trim()) return

        const matches = item.match(pattern)

        if (!matches || !matches.length) {
          values.push({ isInput: true, value: item })
          return
        }

        const idx = item.indexOf('}')
        values.push({ value: item.slice(1, idx) })

        if (idx + 1 < item.length) {
          values.push({ isInput: true, value: item.slice(idx + 1) })
        }
      })

      activeIdx.value = values.length
      modalCheckedValues.value = values
    },
    { immediate: true, deep: true }
  )
</script>

<template>
  <div class="variable-title-input">
    <a-textarea :model-value="value" :autosize="{ minRows: 2, maxRows: 4 }" />
    <a-button type="outline" style="height: auto" @click="openModal">
      <LucideIcon name="Plus" />
    </a-button>
  </div>
  <a-drawer
    v-model:visible="modalVisible"
    width="640px"
    title="自定义流程标题"
    :on-before-ok="updateModalValues"
  >
    <a-spin
      :loading="loading"
      style="width: 100%; height: calc(100vh - 142px); overflow: hidden; box-sizing: border-box"
    >
      <div class="tag-input-flex min-width">
        <div class="header-tags">
          <div
            v-for="(i, idx) in modalCheckedValues"
            :key="idx"
            :class="{ 'tag-item': true, 'is-active': activeIdx === idx }"
          >
            <a-tag v-if="!i.isInput" color="arcoblue" @click="activeIdx = idx + 1">{{
              infoItemNameMap[i.value] || formItemNameMap[i.value] || i.value
            }}</a-tag>
            <a-input v-else v-model="i.value" @focus="activeIdx = idx + 1" />
          </div>
          <div v-show="activeIdx === modalCheckedValues.length" class="is-active"></div>
        </div>
        <a-alert class="header-tags_tip">按 <code>i</code> 插入字符串</a-alert>
        <div class="tag-input-equal-grid min-width" style="--columns: 1fr 2fr">
          <div class="half-grid_item">
            <div class="half-grid_item-header">表单字段</div>
            <a-button v-for="i in formItems" :key="i.value" @click="changeSelectFormItem(i)">{{
              i.labelName
            }}</a-button>
          </div>
          <div class="half-grid_item">
            <div class="half-grid_item-header">基础信息</div>
            <a-tree
              ref="infoTreeRef"
              :data="infoItems"
              :field-names="{ title: 'name', key: 'id' }"
              block-node
              default-expand-all
              @select="changeSelectInfoItem"
            />
          </div>
          <!--          <div class="half-grid_item">-->
          <!--            <a-button @click="changeSelectCustomItem()">插入字符</a-button>-->
          <!--          </div>-->
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<style lang="scss">
  .variable-title-input {
    display: flex;
    flex-shrink: 1;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
  }
  .tag-input-flex.min-width {
    min-width: 400px;
  }
  .tag-input-equal-grid {
    flex: 1;
    flex-shrink: 0;
    min-height: 320px;
    display: grid;
    grid-template-columns: var(--columns);
    overflow: hidden;
  }
  .tag-input-equal-grid.min-width {
    min-width: 400px;
  }
  .header-tags .tag-item {
    display: flex;
    align-items: center;
  }
  .half-grid_item {
    border: 1px solid var(--color-neutral-1);
    box-sizing: border-box;
    padding: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }
  .is-active::before {
    content: '|';
    margin: 0 3px;
    display: inline-block;
    color: #999;
    animation: twinkle 1.4s infinite linear;
  }

  @keyframes twinkle {
    from {
      opacity: 1;
    }
    30% {
      opacity: 0;
    }
    70% {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
