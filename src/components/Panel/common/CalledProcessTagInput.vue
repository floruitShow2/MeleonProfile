<script setup lang="ts">
  import type { PropType } from 'vue'
  import { getCategories, getModelInfoPagerModel, getOrgTree } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TreeInstance } from '@arco-design/web-vue'
  import { filterTreeData } from '@/utils/tools'

  defineOptions({ name: 'CalledProcessTagInput' })

  const $props = defineProps({
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '流程选择'
    },
    multiple: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'modelKey'
    }
  })
  const $emits = defineEmits(['update:data', 'change'])

  const computedTags = computed(() => {
    if (Array.isArray(toRaw($props.data))) {
      return $props.data.map((i) => i.name)
    }
    return []
  })

  const modalVisible = ref(false)
  const modalValues = ref<string[]>([])
  const modalCheckedValues = ref<any[]>([])

  watch(
    () => $props.data,
    () => {
      modalValues.value = ($props.data || []).map((i) => i[$props.rowKey] as string)
      modalCheckedValues.value = [...($props.data || [])]
    },
    { immediate: true, deep: true }
  )

  const loading = ref(false)
  const categoriesData = ref<any[]>([])
  const orgTreeRef = ref<InitRef<TreeInstance>>()
  const processData = ref<any[]>([])
  const totalProcess = ref(0)
  const orgFilterText = ref('')
  const pagination = ref({ pageSize: 15, pageNum: 1 })
  const entity = ref({ categoryCode: '', keyword: '', modelType: 0 })
  const rowSelection = reactive({
    type: $props.multiple ? 'checkbox' : 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  })
  const processTableRef = ref<InitRef<TableInstance>>()

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'modelKey' },
    { title: '发布状态', dataIndex: 'statusName' },
    { title: '所属应用', dataIndex: 'appName' }
  ]

  const computedCategoriesData = computed(() => {
    return filterTreeData(categoriesData.value, 'name', orgFilterText.value)
  })

  const getOrgTreeData = async () => {
    try {
      categoriesData.value = await getCategories()
      await nextTick()
      orgTreeRef.value?.expandAll(true)
    } catch (e) {
      console.error(e)
      categoriesData.value = []
    }
  }
  const getProcessPageData = async (pageNum?: number) => {
    try {
      loading.value = true
      pageNum && (pagination.value.pageNum = pageNum)
      const {
        data: { rows, total }
      } = await getModelInfoPagerModel({
        pager: pagination.value,
        entity: entity.value
      })
      processData.value = rows
      totalProcess.value = total
    } catch (e) {
      console.error(e)
      processData.value = []
      totalProcess.value = 0
    } finally {
      loading.value = false
    }
  }
  const findIdx = (process: any, key: string) => process[$props.rowKey] === key
  const updateSelectOrg = (_, { node }) => {
    entity.value.categoryCode = node.code
    getProcessPageData(1)
  }
  const toggleRowSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    processTableRef.value?.select(row[$props.rowKey], !selected)
    // 需要手动触发选中数据更新
    changeSelect(row, key)
  }
  const changeSelect = (_, key) => {
    if ($props.multiple) {
      const idx = modalCheckedValues.value.findIndex((i) => findIdx(i, key))
      if (idx > -1) {
        modalCheckedValues.value.splice(idx, 1)
      } else {
        modalCheckedValues.value.push(processData.value.find((i) => findIdx(i, key)))
      }
    } else {
      modalCheckedValues.value = [processData.value.find((i) => findIdx(i, key))]
    }
  }
  const removeCheckedValue = (item: any, idx: number) => {
    modalValues.value = modalValues.value.filter((i) => i !== item[$props.rowKey])
    modalCheckedValues.value.splice(idx, 1)
  }

  const updateModalValues = () => {
    $emits('update:data', [...modalCheckedValues.value])
    $emits('change', [...modalCheckedValues.value])
  }

  const openModal = async () => {
    try {
      loading.value = true
      modalVisible.value = true
      await getOrgTreeData()
      await getProcessPageData()
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <a-input-group>
    <a-input-tag :model-value="computedTags" placeholder="请选择流程" :max-tag-count="3" readonly @focus="openModal" />
    <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
  </a-input-group>

  <a-drawer v-model:visible="modalVisible" width="80vw" :title="modalTitle" @ok="updateModalValues">
    <a-spin
      :loading="loading"
      style="width: 100%; height: calc(100vh - 142px); overflow: hidden; box-sizing: border-box"
    >
      <div class="tag-input-flex">
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
        <div class="tag-input-grid" style="--columns: 360px 1fr">
          <div class="left-org-tree">
            <a-input-group>
              <a-input v-model="orgFilterText" placeholder="请输入名称" allow-clear />
              <a-button type="primary"><LucideIcon name="Search" /></a-button>
            </a-input-group>
            <div class="tree-content">
              <a-tree
                ref="orgTreeRef"
                :data="computedCategoriesData"
                :field-names="{ title: 'name', key: 'code' }"
                block-node
                default-expand-all
                @select="updateSelectOrg"
              />
            </div>
          </div>
          <div class="right-table">
            <a-input-group>
              <a-input v-model="entity.keyword" placeholder="请输入名称/KEY" allow-clear />
              <a-button type="primary" @click="getProcessPageData(1)"
                ><LucideIcon name="Search"
              /></a-button>
            </a-input-group>
            <div class="table-content">
              <a-table
                ref="processTableRef"
                v-model:selected-keys="modalValues"
                :row-key="rowKey"
                :row-selection="rowSelection"
                :columns="columns"
                :data="processData"
                :pagination="{
                  current: pagination.pageNum,
                  pageSize: pagination.pageSize,
                  itemCount: totalProcess,
                  pageSizeOptions: [15, 30, 50, 100],
                  showTotal: true,
                  showPageSize: true,
                  onPageSizeChange: (val) => (pagination.pageSize = val) && getProcessPageData(1),
                  onChange: getProcessPageData
                }"
                @row-click="toggleRowSelect"
                @select="changeSelect"
              />
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>
