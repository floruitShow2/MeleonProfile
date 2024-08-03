<script setup lang="ts">
  import type { PropType } from 'vue'
  import { getMatrixRoles, getOrgTree, getRolePagerModel } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TreeInstance } from '@arco-design/web-vue'
  import { filterTreeData } from '@/utils/tools'

  defineOptions({ name: 'RoleTagInput' })

  const $props = defineProps({
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '角色选择'
    },
    multiple: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'sn'
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
  const orgData = ref<any[]>([])
  const orgTreeRef = ref<InitRef<TreeInstance>>()

  const normalRoleData = ref<any[]>([])
  const groupRoleData = ref<any[]>([])
  const companyRoleData = ref<any[]>([])
  const totalPerson = ref(0)
  const orgFilterText = ref('')
  const pagination = ref({ pageSize: 15, pageNum: 1 })
  const entity = ref({ companyId: '', keyword: '' })
  const rowSelection = reactive({
    type: $props.multiple ? 'checkbox' : 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  })

  const activeTab = ref('normal')

  const normalRoleTableRef = ref<InitRef<TableInstance>>()
  const companyRoleTableRef = ref<InitRef<TableInstance>>()
  const groupRoleTableRef = ref<InitRef<TableInstance>>()

  const columns = [
    {
      title: '名称',
      dataIndex: 'name'
    },
    {
      title: '编码',
      dataIndex: 'sn'
    },
    {
      title: '组织',
      dataIndex: 'companyName'
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
  const getNormalRolePageData = async (pageNum?: number) => {
    try {
      loading.value = true
      pageNum && (pagination.value.pageNum = pageNum)
      const {
        data: { rows, total }
      } = await getRolePagerModel({
        pager: pagination.value,
        entity: entity.value
      })
      normalRoleData.value = rows
      totalPerson.value = total
    } catch (e) {
      console.error(e)
      normalRoleData.value = []
      totalPerson.value = 0
    } finally {
      loading.value = false
    }
  }
  const getMatrixGroupRolesData = async () => {
    try {
      const { data: groupData } = await getMatrixRoles({ roleType: 1 })
      groupRoleData.value = groupData || []
    } catch (e) {
      console.error(e)
      normalRoleData.value = []
    }
  }
  const getMatrixCompanyRolesData = async () => {
    try {
      const { data: companyData } = await getMatrixRoles({ roleType: 2 })
      companyRoleData.value = companyData || []
    } catch (e) {
      console.error(e)
      normalRoleData.value = []
    }
  }
  const findIdx = (person: any, key: string) => person[$props.rowKey] === key
  const updateSelectOrg = (_, { node }) => {
    entity.value.companyId = node.companyId
    getNormalRolePageData(1)
  }
  const toggleNormalRowSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    normalRoleTableRef.value?.select(row[$props.rowKey], !selected)
    // 需要手动触发选中数据更新
    changeNormalSelect(row, key)
  }
  const changeNormalSelect = (_, key) => {
    changeSelect(normalRoleData.value, key)
  }
  const toggleCompanyRoleSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    companyRoleTableRef.value?.select(row[$props.rowKey], !selected)
    changeCompanySelect(row, key)
  }
  const changeCompanySelect = (_, key) => {
    changeSelect(companyRoleData.value, key)
  }
  const toggleGroupRoleSelect = (row) => {
    const key = row[$props.rowKey]
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    groupRoleTableRef.value?.select(row[$props.rowKey], !selected)
    changeGroupSelect(row, key)
  }
  const changeGroupSelect = (_, key) => {
    changeSelect(groupRoleData.value, key)
  }
  const changeSelect = (roleData, key) => {
    if ($props.multiple) {
      const idx = modalCheckedValues.value.findIndex((i) => findIdx(i, key))
      if (idx > -1) {
        modalCheckedValues.value.splice(idx, 1)
      } else {
        modalCheckedValues.value.push(roleData.find((i) => findIdx(i, key)))
      }
    } else {
      modalCheckedValues.value = [roleData.find((i) => findIdx(i, key))]
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
      await Promise.all([
        getOrgTreeData(),
        getNormalRolePageData(),
        getMatrixGroupRolesData(),
        getMatrixCompanyRolesData()
      ])
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
      placeholder="请选择角色"
      @focus="openModal"
    />
    <a-button type="primary" @click="openModal">
      <LucideIcon name="Search" />
    </a-button>
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
          >{{ i.name }}
          </a-tag
          >
        </div>
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="normal" title="普通角色">
            <div class="tag-input-special-grid">
              <div class="left-org-tree">
                <a-input-group>
                  <a-input v-model="orgFilterText" placeholder="请输入名称" allow-clear />
                  <a-button type="primary">
                    <LucideIcon name="Search" />
                  </a-button>
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
                  <a-input v-model="entity.keyword" placeholder="请输入标识/名称" allow-clear />
                  <a-button type="primary" @click="getNormalRolePageData(1)">
                    <LucideIcon name="Search" />
                  </a-button>
                </a-input-group>
                <div class="table-content">
                  <a-table
                    ref="normalRoleTableRef"
                    v-model:selected-keys="modalValues"
                    :row-key="rowKey"
                    :row-selection="rowSelection"
                    :columns="columns"
                    :data="normalRoleData"
                    :pagination="{
                      current: pagination.pageNum,
                      pageSize: pagination.pageSize,
                      itemCount: totalPerson,
                      pageSizeOptions: [15, 30, 50, 100],
                      showTotal: true,
                      showPageSize: true,
                      onPageSizeChange: (val) =>
                        (pagination.pageSize = val) && getNormalRolePageData(1),
                      onChange: getNormalRolePageData
                    }"
                    @row-click="toggleNormalRowSelect"
                    @select="changeNormalSelect"
                  />
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="company" title="矩阵公司角色">
            <a-table
              ref="companyRoleTableRef"
              v-model:selected-keys="modalValues"
              :row-key="rowKey"
              :row-selection="rowSelection"
              :columns="columns"
              :data="companyRoleData"
              :pagination="false"
              @row-click="toggleCompanyRoleSelect"
              @select="changeCompanySelect"
            />
          </a-tab-pane>
          <a-tab-pane key="group" title="矩阵部门角色">
            <a-table
              ref="groupRoleTableRef"
              v-model:selected-keys="modalValues"
              :row-key="rowKey"
              :row-selection="rowSelection"
              :columns="columns"
              :data="groupRoleData"
              :pagination="false"
              @row-click="toggleGroupRoleSelect"
              @select="changeGroupSelect"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </a-drawer>
</template>
