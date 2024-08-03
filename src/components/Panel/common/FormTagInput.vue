<script setup lang="ts">
  import type { PropType } from 'vue'
  import { getCategories, getCustomFormPagerModel } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TreeInstance } from '@arco-design/web-vue'
  import { filterTreeData } from '@/utils/tools'

  defineOptions({ name: 'FormTagInput' })

  const $props = defineProps({
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '表单选择'
    },
    multiple: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'code'
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
  const categoriesTreeRef = ref<InitRef<TreeInstance>>()
  const formData = ref<any[]>([])
  const totalForm = ref(0)
  const orgFilterText = ref('')
  const pagination = ref({ pageSize: 15, pageNum: 1 })
  const entity = ref({ companyId: '', keyword: '' })
  const rowSelection = reactive({
    type: $props.multiple ? 'checkbox' : 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  })
  const formTableRef = ref<InitRef<TableInstance>>()

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' }
  ]

  const computedOrgData = computed(() => {
    return filterTreeData(categoriesData.value, 'name', orgFilterText.value)
  })

  const getCategoriesTreeData = async () => {
    try {
      categoriesData.value = await getCategories()
      await nextTick()
      categoriesTreeRef.value?.expandAll(true)
    } catch (e) {
      console.error(e)
      categoriesData.value = []
    }
  }
  const getFormPageData = async (pageNum?: number) => {
    try {
      loading.value = true
      pageNum && (pagination.value.pageNum = pageNum)
      const {
        data: { rows, total }
      } = await getCustomFormPagerModel({
        pager: pagination.value,
        entity: entity.value
      })
      formData.value = rows
      totalForm.value = total
    } catch (e) {
      console.error(e)
      formData.value = []
      totalForm.value = 0
    } finally {
      loading.value = false
    }
  }
  const findIdx = (form: any, key: string) => form[$props.rowKey] === key
  const updateSelectOrg = (_, { node }) => {
    entity.value.companyId = node.companyId
    getFormPageData(1)
  }
  const toggleRowSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    formTableRef.value?.select(row[$props.rowKey], !selected)
    // 需要手动触发选中数据更新
    changeSelect(row, key)
  }
  const changeSelect = (_, key) => {
    if ($props.multiple) {
      const idx = modalCheckedValues.value.findIndex((i) => findIdx(i, key))
      if (idx > -1) {
        modalCheckedValues.value.splice(idx, 1)
      } else {
        modalCheckedValues.value.push(formData.value.find((i) => findIdx(i, key)))
      }
    } else {
      modalCheckedValues.value = [formData.value.find((i) => findIdx(i, key))]
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
      await getCategoriesTreeData()
      await getFormPageData()
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <a-input-group>
    <a-input-tag
      :model-value="computedTags"
      :max-tag-count="3"
      placeholder="请选择表单"
      readonly
      @focus="openModal"
    />
    <a-button type="primary" @click="openModal"><LucideIcon name="Search" /></a-button>
  </a-input-group>

  <a-drawer
    v-model:visible="modalVisible"
    width="960px"
    :title="modalTitle"
    @ok="updateModalValues"
  >
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
                ref="categoriesTreeRef"
                :data="computedOrgData"
                :field-names="{ title: 'name', key: 'id' }"
                block-node
                default-expand-all
                @select="updateSelectOrg"
              />
            </div>
          </div>
          <div class="right-table">
            <a-input-group>
              <a-input v-model="entity.keyword" placeholder="请输入名称/KEY" allow-clear />
              <a-button type="primary" @click="getFormPageData(1)"
                ><LucideIcon name="Search"
              /></a-button>
            </a-input-group>
            <div class="table-content">
              <a-table
                ref="formTableRef"
                v-model:selected-keys="modalValues"
                :row-key="rowKey"
                :row-selection="rowSelection"
                :columns="columns"
                :data="formData"
                :pagination="{
                  current: pagination.pageNum,
                  pageSize: pagination.pageSize,
                  itemCount: totalForm,
                  pageSizeOptions: [15, 30, 50, 100],
                  showTotal: true,
                  showPageSize: true,
                  onPageSizeChange: (val) => (pagination.pageSize = val) && getFormPageData(1),
                  onChange: getFormPageData
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
