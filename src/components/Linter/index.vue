<script setup lang="ts">
  import { FormatedIssuesReport, FormatedIssueReport } from '@/additional/bpmn-lint/bpmn-linting'
  import { modelerKey } from '@/injection-keys'
  import EventEmitter from '@/utils/EventEmitter'
  import { onUnmounted } from 'vue'
  import type Modeler from 'bpmn-js/lib/Modeler'
  import { Event } from 'diagram-js/lib/core/EventBus'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

  defineOptions({ name: 'BpmnLinter' })

  const modeler = inject(modelerKey)

  type LintEvent = Event & {
    issues: FormatedIssuesReport
    count: Record<'error' | 'warn' | 'info', number>
  }
  type CountFormatedIssueReport = {
    [K: string]: {
      name: string
      issues: FormatedIssueReport[]
      count: Record<'error' | 'warn' | 'info', number>
    }
  }
  type BpmnHoverEvent = {
    element: BpmnElement
    gfx: SVGElement
    originalEvent: MouseEvent
    type: string
  }

  const success = '#10d170'
  const info = '#6aa1ff'
  const warn = '#ff9a2e'
  const error = '#f53f3f'

  const issuesMap = ref<CountFormatedIssueReport>({})
  const issuesCount = ref<Record<'error' | 'warn' | 'info', number>>({
    error: 0,
    warn: 0,
    info: 0
  })
  const activeTab = ref<string[]>([])
  const linterState = ref(true)

  const initCallback = (modeler: Modeler) => {
    modeler.on('bpmn-linting.completed', ({ issues, count }: LintEvent) => {
      issuesMap.value = {}
      for (const issuesKey in issues) {
        let error = 0
        let warn = 0
        let info = 0
        let name = ''
        for (const issue of issues[issuesKey]) {
          name = issue.name
          issue.category === 'error' && error++
          issue.category === 'warn' && warn++
          issue.category === 'info' && info++
        }
        issuesMap.value[issuesKey] = {
          name,
          count: { error, warn, info },
          issues: issues[issuesKey]
        }
      }
      issuesCount.value = count
    })

    modeler.on('selection.changed', ({ newSelection = [] }) => {
      activeTab.value = newSelection
        .filter((element: BpmnElement) => issuesMap.value[element.id])
        .map((element: BpmnElement) => element.id)
    })
  }

  const locationToElement = (id) => {
    const selection = modeler!.value!.get<Selection>('selection')
    const registry = modeler!.value!.get<ElementRegistry>('elementRegistry')
    selection.select([registry.find((element) => element.id === id)])
  }

  // 监听 modeler 实例化事件
  EventEmitter.on('modeler-init', initCallback)

  onUnmounted(() => {
    EventEmitter.removeListener('modeler-init', initCallback)
  })
</script>

<template>
  <div class="bpmn-linter" :class="{ open: linterState }">
    <div class="toggle-btn" @click="linterState = !linterState">
      <icon-double-up />
    </div>
    <a-card title="流程校验" hoverable>
      <template #extra>
        <a-tag :color="issuesCount.error ? error : success" size="small" title="错误">
          <template #icon>
            <icon-close-circle />
          </template>
          {{ issuesCount.error }}
        </a-tag>
        <a-tag v-show="issuesCount.warn" :color="warn" size="small" title="警告">
          <template #icon>
            <icon-exclamation-circle />
          </template>
          {{ issuesCount.warn }}
        </a-tag>
        <a-tag v-show="issuesCount.info" :color="info" size="small" title="提示">
          <template #icon>
            <icon-info-circle />
          </template>
          {{ issuesCount.info }}
        </a-tag>
      </template>
      <a-collapse v-model:active-key="activeTab" :bordered="false">
        <a-collapse-item
          v-for="(elIssues, key) in issuesMap"
          :key="key"
          :header="elIssues.name || (key as string)"
        >
          <template #extra>
            <a-tag :color="error" size="small" title="错误">
              <template #icon>
                <icon-close-circle />
              </template>
              {{ elIssues.count.error }}
            </a-tag>
            <a-tag v-show="elIssues.count.warn" :color="warn" size="small" title="警告">
              <template #icon>
                <icon-exclamation-circle />
              </template>
              {{ elIssues.count.warn }}
            </a-tag>
            <a-tag v-show="elIssues.count.info" :color="info" size="small" title="提示">
              <template #icon>
                <icon-info-circle />
              </template>
              {{ elIssues.count.info }}
            </a-tag>
            <a-button
              class="bpmn-linter__location"
              size="mini"
              title="定位到该元素"
              @click.stop="locationToElement(key)"
            >
              <lucide-icon :size="12" name="LocateFixed" />
            </a-button>
          </template>
          <div v-for="(item, idx) in elIssues.issues" :key="idx" class="bpmn-linter__info-item">
            {{ `${idx + 1}. ${item.message}` }}
          </div>
        </a-collapse-item>
      </a-collapse>
    </a-card>
  </div>
</template>
