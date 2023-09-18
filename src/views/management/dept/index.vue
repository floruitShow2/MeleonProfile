<template>
  <div class="container">
    <header class="container-header">
      <h4 class="container-header_title">{{ $t('dept.title') }}</h4>
      <div class="container-header_tool">
        <WsSearch id="dept" :fetch-fuzzy-list="FetchFuzzyList" @on-select="onDeptSelect" />
        <a-button type="primary" size="small" @click="handleCreateDept">
          {{ $t('dept.create') }}
        </a-button>
      </div>
    </header>
    <section class="container-section">
      <div class="tree-container">
        <a-tree
          v-if="deptTree.length"
          v-model:selectedKeys="selectedKeys"
          :data="deptTree"
          block-node
          :field-names="{
            key: 'id',
            title: 'name'
          }"
          @select="onTreeNodeSelect"
        />
      </div>
      <div class="detail-container">
        <div v-if="currentDept" class="detail-dept">
          <div class="detail-dept_header">
            <span>{{ currentDept.label }}</span>
            <div class="tool">
              <i class="iconfont ws-edit ibtn_primary" @click="handleEditDept"></i>
              <a-popconfirm :content="$t('dept.remove.content')" @ok="onRemoveDeptById">
                <i class="iconfont ws-delete ibtn_danger"></i>
              </a-popconfirm>
            </div>
          </div>
          <div class="detail-dept_content">
            <div v-for="k in displayField" :key="k" class="item">
              <span>{{ $t(`dept.${k}`) }}</span>
              <span>
                {{
                  k.indexOf('Time') !== -1
                    ? formatToDateTime(currentDept[k]?.toString())
                    : currentDept[k]
                }}
              </span>
            </div>
          </div>
        </div>
        <!-- <WsOrgTree /> -->
      </div>
    </section>

    <a-modal v-model:visible="isModalShow">aaa</a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount } from 'vue'
  import WsSearch, { ConvertToSearchFuzzyList, FuzzyResultType } from '@/components/search/index'
  import { FetchAllDepts, BatchRemoveByIds } from '@/api/management/dept'
  import { formatToDateTime } from '@/utils/format/time'
  import { ConvertToTree } from './config/index'

  // header
  const selectedKeys = ref<Array<string | number>>([])
  const deptTree = ref<Array<ApiDept.DeptInstance>>([])
  const FetchFuzzyList = (query: string): FuzzyResultType => {
    if (!query.length) {
      return {
        hits: [],
        nbHits: 0
      }
    }

    return ConvertToSearchFuzzyList(deptTree.value, query)
  }
  const onDeptSelect = ({ id }: { id: string | number }) => {
    selectedKeys.value = [id]
  }

  // tree
  const deptList = ref<ApiDept.DeptInstance[]>([])
  const currentDept = ref<ApiDept.DeptInstance | null>(null)

  const onTreeNodeSelect = (keys: Array<number | string>) => {
    if (!keys.length) return
    const selectedDept = deptList.value.find((dept) => dept.id === keys[0])
    if (selectedDept) currentDept.value = selectedDept
  }

  const updateDeptTree = async () => {
    const res = await FetchAllDepts()
    if (!res.data) return
    deptList.value = res.data
    deptTree.value = ConvertToTree(res.data)
    // 默认展开，后续将 17 调整为当前用户所属部门的 id
    onTreeNodeSelect([17])
    selectedKeys.value = [17]
  }

  onBeforeMount(updateDeptTree)

  const isModalShow = ref(false)
  const editMode = ref<'edit' | 'create'>('create')
  const displayField: Array<keyof ApiDept.DeptInstance> = [
    'createBy',
    'createTime',
    'updateBy',
    'updateTime'
  ]
  const operatingDept = ref<ApiDept.DeptInstance | null>(null)

  const handleCreateDept = () => {
    const baseDept: ApiDept.DeptInstance = {
      id: 0,
      pid: 0,
      name: '',
      label: '',
      updateBy: '',
      createBy: '',
      updateTime: '',
      createTime: '',
      deptSort: 0,
      subCount: 0,
      leaf: false,
      enabled: false,
      hasChildren: false
    }
    operatingDept.value = baseDept
    isModalShow.value = true
    editMode.value = 'create'
  }
  const handleEditDept = () => {
    isModalShow.value = true
    editMode.value = 'edit'
  }

  function captureIdList<T>(target: any[], res: T[]) {
    target.forEach((cur) => {
      if (cur.pid === res.at(-1)) res.push(cur.id)
      if (cur.children && cur.children.length) captureIdList(cur.children, res)
    })
  }
  const onRemoveDeptById = async () => {
    const id = currentDept.value?.id
    if (!id) return
    const list = [id]
    // 获取当前部门及其下属部门的 id 列表
    captureIdList(deptTree.value, list)
    const res = await BatchRemoveByIds(list)
    console.log(res)
  }
</script>

<style scoped lang="less">
  @import '@/styles/theme.less';
  @import '@/styles/layout.less';
  @import '@/styles/button.mixin.less';
  .container {
    width: 100%;
    height: calc(100vh - 60px);
    padding: 20px;
    #flex(column, flex-start, flex-start);
    #color(background-color, --primary-bg-color);
    &-header {
      width: 100%;
      margin-bottom: 20px;
      padding: 10px 15px;
      border-radius: 5px;
      #color(background-color, --module-bg-color);
      #flex(row, center, space-between);
      &_title {
        font-size: 18px;
        font-weight: 700;
        #color(color, --primary-text-color);
      }
      &_tool {
        #flex(row, center, flex-end);
        .arco-btn {
          margin-left: 8px;
        }
      }
    }
    &-section {
      width: 100%;
      height: calc(100% - 24px);
      #flex(row, flex-start, space-between);
      .tree-container {
        width: 300px;
        height: 100%;
        padding: 10px;
        margin-right: 20px;
        border-radius: 5px;
        overflow: auto;
        background-color: var(--color-bg-2);
      }
      .detail-container {
        height: 100%;
        width: calc(100% - 300px - 20px);
        padding: 10px;
        border-radius: 5px;
        background-color: var(--color-bg-2);
        .detail-dept {
          width: 300px;
          padding: 10px;
          #flex(column, flex-start, flex-start);
          &_header {
            width: 100%;
            padding-bottom: 8px;
            margin-bottom: 8px;
            border-bottom: dashed 1px;
            #flex(row, center, space-between);
            #color(border-bottom-color, --primary-border-color);
            span {
              font-size: 18px;
              font-weight: 800;
              #color(color, --primary-text-color);
            }
            .tool > i {
              margin-left: 5px;
            }
          }
          &_content {
            width: 100%;
            #flex(column, flex-start, flex-start);
            span {
              font-size: 14px;
              margin-bottom: 8px;
              #color(color, --primary-text-color);
            }
            .item {
              width: 100%;
              margin-bottom: 5px;
              #flex(row, center, space-between);
            }
          }
        }
      }
    }
  }
</style>
~/src/utils/format/time
