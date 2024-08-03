<script setup lang="ts">
  import type { PropType } from 'vue'
  import {
    getBaseVariables,
    getCompanies,
    getCompanyVariables,
    getDeptVariables,
    getFormVariablesByCode,
    getMatrixCompanyVariables,
    getMatrixDeptVariables,
    getOrgTree,
    getPersonalPagerModel,
    getPersonalVariables,
    getRoleVariablesByOrgId
  } from '@/api/bpmn'
  import { InitRef } from '@/components/Panel/common/types'
  import { TableInstance, TreeInstance } from '@arco-design/web-vue'
  import { filterTreeData } from '@/utils/tools'

  defineOptions({ name: 'StaticUserTagInput' })

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: ''
    },
    data: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    modalTitle: {
      type: String as PropType<string>,
      default: '固定值变量选择器'
    },
    multiple: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    more: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    personSpecial: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    processId: {
      type: String as PropType<string>,
      default: ''
    }
  })
  const $emits = defineEmits(['update:data', 'update:value', 'change-data', 'change-value'])

  // const computedTags = computed(() => {
  //   if (Array.isArray(toRaw($props.data))) {
  //     return $props.data.map((i) => i.name)
  //   }
  //   return []
  // })
  const computedModelValue = computed({
    get: () => $props.value,
    set: (value) => {
      $emits('update:value', value)
      $emits('change-value', value)
    }
  })

  const modalVisible = ref(false)
  const modalValues = ref<string[]>([])
  const modalCheckedValues = ref<any[]>([])

  watch(
    () => $props.data,
    () => {
      modalValues.value = ($props.data || []).map((i) => i.value)
      modalCheckedValues.value = [...($props.data || [])]
    },
    { immediate: true, deep: true }
  )

  const loading = ref(false)
  // 静态控制
  const personColumns = [
    { title: '姓名', dataIndex: 'name' },
    // { title: '工号', dataIndex: 'code' },
    { title: '手机', dataIndex: 'mobile' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '组织', dataIndex: 'companyName' },
    { title: '部门', dataIndex: 'deptName' }
  ]
  const roleColumns = [
    { title: '类型', dataIndex: 'name' },
    { title: '标识', dataIndex: 'code' },
    { title: '组织', dataIndex: 'companyName' }
  ]
  const commonColumns = [
    { title: '名称', dataIndex: 'name' },
    { title: '变量名', dataIndex: 'value' },
    { title: '备注', dataIndex: 'remark' }
  ]

  // 公共部分
  const rowSelection = reactive({
    type: $props.multiple ? 'checkbox' : 'radio',
    showCheckedAll: false,
    onlyCurrent: false
  })
  // 人员部分
  const orgData = ref<any[]>([])
  const orgTreeRef = ref<InitRef<TreeInstance>>()
  const orgFilterText = ref('')
  const pagination = ref({ pageSize: 15, pageNum: 1 })
  const entity = ref({ companyId: '', keyword: '' })
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
  const totalPerson = ref(0)
  const personTableData = ref<any[]>([])
  const personTableRef = ref<InitRef<TableInstance>>()
  const getPersonPageData = async (pageNum?: number) => {
    try {
      loading.value = true
      pageNum && (pagination.value.pageNum = pageNum)
      const {
        data: { rows = [], total }
      } = await getPersonalPagerModel({
        pager: pagination.value,
        entity: entity.value
      })
      rows.forEach((item) => (item['value'] = item['code']))
      personTableData.value = rows
      totalPerson.value = total
    } catch (e) {
      console.error(e)
      personTableData.value = []
      totalPerson.value = 0
    } finally {
      loading.value = false
    }
  }
  const updateSelectOrg = (_, { node }) => {
    entity.value.companyId = node.companyId
    getPersonPageData(1)
  }
  // 角色
  const companyFilterText = ref('')
  const companyTreeData = ref<any[]>([])
  const companyTreeRef = ref<InitRef<TreeInstance>>()
  const computedCompanyData = computed(() => {
    return filterTreeData(companyTreeData.value, 'cname', companyFilterText.value)
  })
  const getCompanyTreeData = async () => {
    try {
      companyTreeData.value = await getCompanies()
      await nextTick()
      companyTreeRef.value?.expandAll(true)
    } catch (e) {
      console.error(e)
      companyTreeData.value = []
    }
  }
  const roleEntity = ref({ orgId: '' })
  const roleTableData = ref<any[]>([])
  const roleTableRef = ref<InitRef<TableInstance>>()
  const roleExpandTableRef = ref<InitRef<TableInstance | TableInstance[]>>()
  const getRoleData = async () => {
    try {
      loading.value = true
      const flag = !$props.multiple && 'one'
      const { data } = await getRoleVariablesByOrgId({ ...roleEntity.value, flag })
      roleTableData.value = data
      roleTableRef.value?.expandAll()
    } catch (e) {
      roleTableData.value = []
    } finally {
      loading.value = false
    }
  }
  const updateSelectCompany = async (_, { node }) => {
    roleEntity.value.orgId = node.id
    await getRoleData()
  }
  // 表单
  const formTableData = ref<any[]>([])
  const formTableRef = ref<InitRef<TableInstance>>()
  const getFormData = async () => {
    try {
      loading.value = true
      const { data } = await getFormVariablesByCode($props.processId)
      formTableData.value = data
    } catch (e) {
      formTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 矩阵公司
  const matrixCompanyTableData = ref<any[]>([])
  const matrixCompanyTableRef = ref<InitRef<TreeInstance>>()
  const getMatrixCompanyRolesData = async () => {
    try {
      loading.value = true
      const flag = !$props.multiple && 'one'
      const { data } = await getMatrixCompanyVariables({ flag })
      matrixCompanyTableData.value = data
    } catch (e) {
      matrixCompanyTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 矩阵部门
  const matrixGroupTableData = ref<any[]>([])
  const matrixGroupTableRef = ref<InitRef<TreeInstance>>()
  const getMatrixGroupRolesData = async () => {
    try {
      loading.value = true
      const flag = !$props.multiple && 'one'
      const { data } = await getMatrixDeptVariables({ flag })
      matrixGroupTableData.value = data
    } catch (e) {
      matrixGroupTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 公司
  const companyTableData = ref<any[]>([])
  const companyTableRef = ref<InitRef<TableInstance>>()
  const getCompanyData = async () => {
    try {
      loading.value = true
      const { data } = await getCompanyVariables()
      companyTableData.value = data
    } catch (e) {
      companyTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 部门
  const groupTableData = ref<any[]>([])
  const groupTableRef = ref<InitRef<TableInstance>>()
  const getGroupData = async () => {
    try {
      loading.value = true
      const { data } = await getDeptVariables()
      groupTableData.value = data
    } catch (e) {
      groupTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 提交人
  const authorTableData = ref<any[]>([])
  const authorTableRef = ref<InitRef<TableInstance>>()
  const getAuthorData = async () => {
    try {
      loading.value = true
      const { data } = await getPersonalVariables()
      authorTableData.value = data
    } catch (e) {
      authorTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // 基础
  const baseTableData = ref<any[]>([])
  const baseTableRef = ref<InitRef<TableInstance>>()
  const getBaseData = async () => {
    try {
      loading.value = true
      const { data } = await getBaseVariables()
      baseTableData.value = data
    } catch (e) {
      baseTableData.value = []
    } finally {
      loading.value = false
    }
  }
  // tabs 控制
  const activeTab = ref('person')
  // 数据选择与更新
  const dataMap = {
    person: personTableData,
    role: roleTableData,
    form: formTableData,
    companyMatrix: matrixCompanyTableData,
    groupMatrix: matrixGroupTableData,
    company: companyTableData,
    group: groupTableData,
    author: authorTableData,
    basic: baseTableData
  }
  const tableRefMap = {
    person: personTableRef,
    role: roleTableRef,
    form: formTableRef,
    companyMatrix: matrixCompanyTableRef,
    groupMatrix: matrixGroupTableRef,
    company: companyTableRef,
    group: groupTableRef,
    author: authorTableRef,
    basic: baseTableRef
  }
  const findIdx = (row: any, target: string) => row.value === target
  const changeSelect = (tabKey: string, value: string, data?: any[]) => {
    const sourceData = tabKey === 'role' ? data : dataMap[tabKey].value
    // 单选
    if (!$props.multiple) {
      const item = sourceData.find((i) => findIdx(i, value))
      modalCheckedValues.value = [{ ...item, tabKey }]
      return
    }
    // 多选需要判断人员互斥情况与选中情况
    const idx = modalCheckedValues.value.findIndex((i) => findIdx(i, value))
    // 清除已选时不处理
    if (idx > -1) {
      modalCheckedValues.value.splice(idx, 1)
      return
    }
    // 增加选中时，判断互斥效果
    const item = sourceData.find((i) => findIdx(i, value))
    modalCheckedValues.value.push({ ...item, tabKey })

    if (!$props.personSpecial) return
    if (tabKey === 'person') {
      modalCheckedValues.value = modalCheckedValues.value.filter((i) => i.tabKey === 'person')
    } else {
      modalCheckedValues.value = modalCheckedValues.value.filter((i) => i.tabKey !== 'person')
    }
    modalValues.value = modalCheckedValues.value.map((i) => i.value)
  }
  const toggleRowSelect = (tabKey: string, row: any, data?: any[]) => {
    const key = row.value
    const selected = modalCheckedValues.value.findIndex((i) => findIdx(i, key)) > -1
    // 角色 嵌套表格特殊处理
    if (tabKey === 'role') {
      if (Array.isArray(roleExpandTableRef.value)) {
        roleExpandTableRef.value?.forEach((tableRef) => {
          tableRef?.select(key, !selected)
        })
      } else {
        roleExpandTableRef.value?.select(key, !selected)
      }
    } else {
      tableRefMap[tabKey].value?.select(key, !selected)
    }
    changeSelect(tabKey, key, data)
  }

  const removeCheckedValue = (item: any, idx: number) => {
    modalValues.value = modalValues.value.filter((i) => i !== item.value)
    modalCheckedValues.value.splice(idx, 1)
  }

  const openModal = async () => {
    try {
      loading.value = true
      modalVisible.value = true
      await Promise.all([getOrgTreeData(), getCompanyTreeData(), getPersonPageData(1)])
    } finally {
      loading.value = false
    }
  }
  const loadTabData = (key) => {
    switch (key) {
      case 'person':
        !personTableData.value.length && getPersonPageData(1)
        return
      case 'role':
        // !roleTableData.value.length && getRoleData()
        return
      case 'form':
        !formTableData.value.length && getFormData()
        return
      case 'companyMatrix':
        !matrixCompanyTableData.value.length && getMatrixCompanyRolesData()
        return
      case 'groupMatrix':
        !matrixGroupTableData.value.length && getMatrixGroupRolesData()
        return
      case 'company':
        !companyTableData.value.length && getCompanyData()
        return
      case 'group':
        !groupTableData.value.length && getGroupData()
        return
      case 'author':
        !authorTableData.value.length && getAuthorData()
        return
      case 'basic':
        !baseTableData.value.length && getBaseData()
        return
    }
  }

  const updateModalValues = () => {
    $emits('update:data', [...modalCheckedValues.value])
    $emits('change-data', [...modalCheckedValues.value])
  }
</script>

<template>
  <a-input-group>
    <a-input v-model="computedModelValue" placeholder="请输入审批人" />
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
            :key="i.value"
            color="arcoblue"
            closable
            @close="removeCheckedValue(i, idx)"
            >{{ i.name }}</a-tag
          >
        </div>
        <a-tabs v-model:active-key="activeTab" @tab-click="loadTabData">
          <a-tab-pane key="person" title="人员">
            <div class="tag-input-special-grid">
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
                  <a-input v-model="entity.keyword" placeholder="请输入标识/名称" allow-clear />
                  <a-button type="primary" @click="getPersonPageData(1)">
                    <LucideIcon name="Search" />
                  </a-button>
                </a-input-group>
                <div class="table-content">
                  <a-table
                    ref="personTableRef"
                    v-model:selected-keys="modalValues"
                    row-key="value"
                    :row-selection="rowSelection"
                    :columns="personColumns"
                    :data="personTableData"
                    :pagination="{
                      current: pagination.pageNum,
                      pageSize: pagination.pageSize,
                      itemCount: totalPerson,
                      pageSizeOptions: [15, 30, 50, 100],
                      showTotal: true,
                      showPageSize: true,
                      onPageSizeChange: (val) =>
                        (pagination.pageSize = val) && getPersonPageData(1),
                      onChange: getPersonPageData
                    }"
                    @row-click="(row) => toggleRowSelect('person', row)"
                    @select="(_, key) => changeSelect('person', key)"
                  />
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="role" title="角色">
            <div class="tag-input-special-grid">
              <div class="left-org-tree">
                <a-input-group>
                  <a-input v-model="companyFilterText" placeholder="请输入名称" allow-clear />
                  <a-button type="primary"><LucideIcon name="Search" /></a-button>
                </a-input-group>
                <div class="tree-content">
                  <a-tree
                    ref="companyTreeRef"
                    :data="computedCompanyData"
                    :field-names="{ title: 'cname', key: 'id' }"
                    block-node
                    default-expand-all
                    @select="updateSelectCompany"
                  />
                </div>
              </div>
              <div class="right-table">
                <a-table
                  ref="roleTableRef"
                  row-key="code"
                  :expandable="{ title: ' ', width: 40 }"
                  :columns="roleColumns"
                  :data="roleTableData"
                  :pagination="false"
                  default-expand-all-rows
                >
                  <template #expand-row="{ record }">
                    <a-table
                      ref="roleExpandTableRef"
                      v-model:selected-keys="modalValues"
                      row-key="value"
                      :row-selection="rowSelection"
                      :columns="commonColumns"
                      :data="record.roles"
                      :pagination="false"
                      @row-click="(row) => toggleRowSelect('role', row, record.roles)"
                      @select="(_, key) => changeSelect('role', key, record.roles)"
                    />
                  </template>
                </a-table>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="form" title="表单">
            <a-table
              ref="formTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="formTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('form', row)"
              @select="(_, key) => changeSelect('form', key)"
            />
          </a-tab-pane>
          <a-tab-pane key="companyMatrix" title="公司矩阵">
            <a-table
              ref="matrixCompanyTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="matrixCompanyTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('companyMatrix', row)"
              @select="(_, key) => changeSelect('companyMatrix', key)"
            />
          </a-tab-pane>
          <a-tab-pane key="groupMatrix" title="部门矩阵">
            <a-table
              ref="matrixGroupTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="matrixGroupTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('groupMatrix', row)"
              @select="(_, key) => changeSelect('groupMatrix', key)"
            />
          </a-tab-pane>
          <a-tab-pane v-if="more" key="company" title="公司">
            <a-table
              ref="companyTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="companyTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('company', row)"
              @select="(_, key) => changeSelect('company', key)"
            />
          </a-tab-pane>
          <a-tab-pane v-if="more" key="group" title="部门">
            <a-table
              ref="groupTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="groupTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('group', row)"
              @select="(_, key) => changeSelect('group', key)"
            />
          </a-tab-pane>
          <a-tab-pane v-if="more" key="author" title="提交人">
            <a-table
              ref="authorTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="authorTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('author', row)"
              @select="(_, key) => changeSelect('author', key)"
            />
          </a-tab-pane>
          <!--          <a-tab-pane v-if="more" key="basic" title="基础">
            <a-table
              ref="baseTableRef"
              v-model:selected-keys="modalValues"
              row-key="value"
              :row-selection="rowSelection"
              :columns="commonColumns"
              :data="baseTableData"
              :pagination="false"
              @row-click="(row) => toggleRowSelect('basic', row)"
              @select="(_, key) => changeSelect('basic', key)"
            />
          </a-tab-pane>-->
        </a-tabs>
      </div>
    </a-spin>
  </a-drawer>
</template>
