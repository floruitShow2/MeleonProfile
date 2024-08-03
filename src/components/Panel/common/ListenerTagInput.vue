<script setup lang="ts">
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getListenersAndParams } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TableRowSelection } from '@arco-design/web-vue'

  defineOptions({ name: 'ListenerTagInput' })

  const { t } = useI18n()

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    listenerType: {
      type: String as PropType<'executionListener' | 'taskListener'>,
      default: 'executionListener'
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'value'
    }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const loading = ref(false)
  const modalVisible = ref(false)
  const listeners = ref<any[]>([])
  const allListeners = ref<any[]>([])
  const name = ref('')

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '值', dataIndex: 'value' },
    { title: '类型', width: 120, slotName: 'type' },
    { title: t('Operation'), width: 128, slotName: 'operation' }
  ]
  const rowSelection: TableRowSelection = {
    type: 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  }
  const listenerTableRef = ref<InitRef<TableInstance>>()

  const modalValues = ref<string[]>([])
  const modalCheckedValues = ref<any[]>([])

  watch(
    () => $props.value,
    () => {
      modalValues.value = $props.value ? [$props.value] : []
    },
    { immediate: true, deep: true }
  )

  const openModal = async () => {
    try {
      name.value = ''
      loading.value = true
      modalVisible.value = true
      await getListenersData()
      modalCheckedValues.value = allListeners.value.filter((i) =>
        modalValues.value.includes(i[$props.rowKey])
      )
    } catch (e) {
      listeners.value = []
    } finally {
      loading.value = false
    }
  }
  const getListenersData = async () => {
    try {
      loading.value = true
      const { data = [] } = await getListenersAndParams({
        listenerType: $props.listenerType,
        name: name.value,
        type: 'class'
      })
      listeners.value = data
      if (!name.value) {
        allListeners.value = [...data]
      }
    } catch (e) {
      listeners.value = []
    } finally {
      loading.value = false
    }
  }
  const findIdx = (listener: any, key: string) => listener[$props.rowKey] === key

  const toggleListenerSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    listenerTableRef.value?.select(row[$props.rowKey], !selected)
    changeListenerSelect([key])
  }

  const changeListenerSelect = (keys) => {
    const selectedKey = keys[0]
    modalCheckedValues.value = listeners.value.filter((i) => i[$props.rowKey] === selectedKey)
  }

  const removeCheckedValue = (item: any, idx: number) => {
    modalValues.value = modalValues.value.filter((i) => i !== item[$props.rowKey])
    modalCheckedValues.value.splice(idx, 1)
  }
  const updateModalValues = () => {
    const value = modalValues.value[0]
    $emits('update:value', value)
    $emits('change', value, modalCheckedValues.value[0])
  }
</script>

<template>
  <a-input-group>
    <a-input
      :model-value="value"
      placeholder="请输入监听器"
      @input="(val) => $emits('update:value', val)"
    />
    <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
  </a-input-group>

  <a-drawer v-model:visible="modalVisible" width="840px" title="选择监听器" @ok="updateModalValues">
    <a-spin
      :loading="loading"
      style="width: 100%; height: calc(100vh - 142px); overflow: hidden; box-sizing: border-box"
    >
      <div class="tag-input-flex" style="gap: 10px">
        <div class="header-tags">
          <a-tag
            v-for="(i, idx) in modalCheckedValues"
            :key="i[rowKey]"
            color="arcoblue"
            closable
            @close="removeCheckedValue(i, idx)"
            >{{ i.name }}</a-tag
          >
        </div>

        <a-input-group>
          <!--          <a-input v-model="name" :error="false" allow-clear />-->
          <span class="arco-input-wrapper">
            <input
              v-model="name"
              class="arco-input arco-input-size-small"
              placeholder="请输入名称"
            />
          </span>
          <a-button type="primary" @click="getListenersData"><LucideIcon name="Search" /></a-button>
        </a-input-group>

        <a-table
          ref="listenerTableRef"
          v-model:selected-keys="modalValues"
          :columns="columns"
          :data="listeners"
          :row-selection="rowSelection"
          :pagination="false"
          :row-key="rowKey"
          @row-click="toggleListenerSelect"
          @select="changeListenerSelect"
        >
          <template #type="{ record }">
            {{ $t(record.type) }}
          </template>
          <template #operation="{ record }">
            <a-popover title="参数列表" position="left">
              <a-button type="text">查看参数</a-button>
              <template #content>
                <div class="field-pop-table">
                  <div class="field-pop-table_th">名称</div>
                  <div class="field-pop-table_th">类型</div>
                  <div class="field-pop-table_th">值</div>
                  <template v-for="f in record.flowListenerParamList" :key="f.id">
                    <div class="field-pop-table_td">{{ f.name }}</div>
                    <div class="field-pop-table_td">{{ $t(f.type) }}</div>
                    <div class="field-pop-table_td">{{ f.value || '' }}</div>
                  </template>
                  <div v-show="!record.flowListenerParamList?.length" class="field-pop-table_empty">
                    <a-empty v-show="!record.flowListenerParamList?.length" />
                  </div>
                </div>
              </template>
            </a-popover>
          </template>
        </a-table>
      </div>
    </a-spin>
  </a-drawer>
</template>

<style lang="scss">
  .field-pop-table {
    display: grid;
    width: 20vw;
    min-width: 400px;
    grid-template-columns: 1fr 80px 1fr;
    box-sizing: border-box;
    padding: 10px;
    .field-pop-table_th,
    .field-pop-table_td {
      font-size: 12px;
      line-height: 32px;
      padding: 0 8px;
      border-bottom: 1px solid var(--color-fill-4);
      word-break: break-word;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .field-pop-table_th {
      font-weight: bold;
    }
    .field-pop-table_empty {
      grid-column: 1 / 4;
      text-align: center;
      display: flex;
      justify-content: center;
    }
  }
</style>
