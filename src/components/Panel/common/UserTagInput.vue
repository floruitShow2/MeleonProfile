<script setup lang="ts">
  import type { PropType } from 'vue'
  import { getOrgTree, getPersonalPagerModel } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TreeInstance } from '@arco-design/web-vue'
  import { filterTreeData } from '@/utils/tools'

  defineOptions({ name: 'UserTagInput' })

  const $props = defineProps({
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '人员选择'
    },
    multiple: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'id'
    }
  })
  const $emits = defineEmits(['update:data', 'change'])
  defineSlots<{ default: () => any }>()

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
  const orgData = ref<any[]>([])
  const orgTreeRef = ref<InitRef<TreeInstance>>()
  const personData = ref<any[]>([])
  const totalPerson = ref(0)
  const orgFilterText = ref('')
  const pagination = ref({ pageSize: 15, pageNum: 1 })
  const entity = ref({ companyId: '', keyword: '' })
  const rowSelection = reactive({
    type: $props.multiple ? 'checkbox' : 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  })
  const personTableRef = ref<InitRef<TableInstance>>()

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name'
    },
    // {
    //   title: '工号',
    //   dataIndex: 'code'
    // },
    {
      title: '手机',
      dataIndex: 'mobile'
    },
    {
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      title: '组织',
      dataIndex: 'companyName'
    },
    {
      title: '部门',
      dataIndex: 'deptName'
    }
  ]

  const computedOrgData = computed(() => {
    return filterTreeData(orgData.value, 'name', orgFilterText.value)
  })

  const getOrgTreeData = async () => {
    try {
      orgData.value = await getOrgTree()
      await nextTick()
      orgTreeRef.value?.expandAll(true)
    } catch (e) {
      console.error(e)
      orgData.value = []
    }
  }
  const getPersonPageData = async (pageNum?: number) => {
    try {
      loading.value = true
      pageNum && (pagination.value.pageNum = pageNum)
      const {
        data: { rows, total }
      } = await getPersonalPagerModel({
        pager: pagination.value,
        entity: entity.value
      })
      personData.value = rows
      totalPerson.value = total
    } catch (e) {
      console.error(e)
      personData.value = []
      totalPerson.value = 0
    } finally {
      loading.value = false
    }
  }
  const findIdx = (person: any, key: string) => person[$props.rowKey] === key
  const updateSelectOrg = (_, { node }) => {
    entity.value.companyId = node.companyId
    getPersonPageData(1)
  }
  const toggleRowSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    personTableRef.value?.select(row[$props.rowKey], !selected)
    // 需要手动触发选中数据更新
    changeSelect(row, key)
  }
  const changeSelect = (_, key) => {
    if ($props.multiple) {
      const idx = modalCheckedValues.value.findIndex((i) => findIdx(i, key))
      if (idx > -1) {
        modalCheckedValues.value.splice(idx, 1)
      } else {
        modalCheckedValues.value.push(personData.value.find((i) => findIdx(i, key)))
      }
    } else {
      modalCheckedValues.value = [personData.value.find((i) => findIdx(i, key))]
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
      await getPersonPageData()
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <a-input-group>
    <a-input-tag
      v-if="!$slots.default"
      :model-value="computedTags"
      :max-tag-count="3"
      placeholder="请选择人员"
      @focus="openModal"
    />
    <slot />
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
              <a-input
                v-model="entity.keyword"
                placeholder="请输入工号/姓名/手机号码"
                allow-clear
              />
              <a-button type="primary" @click="getPersonPageData(1)"
                ><LucideIcon name="Search"
              /></a-button>
            </a-input-group>
            <div class="table-content">
              <a-table
                ref="personTableRef"
                v-model:selected-keys="modalValues"
                :row-key="rowKey"
                :row-selection="rowSelection"
                :columns="columns"
                :data="personData"
                :pagination="{
                  current: pagination.pageNum,
                  pageSize: pagination.pageSize,
                  itemCount: totalPerson,
                  pageSizeOptions: [15, 30, 50, 100],
                  showTotal: true,
                  showPageSize: true,
                  onPageSizeChange: (val) => (pagination.pageSize = val) && getPersonPageData(1),
                  onChange: getPersonPageData
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

<style lang="scss"></style>
