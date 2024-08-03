// @ts-ignore
import { Linter } from 'bpmnlint'
import { groupBy } from 'min-dash'
import Modeler from 'bpmn-js/lib/Modeler'
import Canvas from 'diagram-js/lib/core/Canvas'
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
import EventBus from 'diagram-js/lib/core/EventBus'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import Translate from '@/flowable/additional/translate'

import { is } from 'bpmn-js/lib/util/ModelUtil'
import { debounce } from '@/flowable/utils/debounce'
import Resolver from '@/flowable/additional/lint/Resolver'
import { LintRuleFlag, Rules } from '@/flowable/additional/lint/rules'

export type LintConfig = {
  active?: boolean
  bpmnlint?: {
    resolver?: Resolver
    config: {
      rules?: Rules
    }
  }
}
export type IssueReport = {
  id: string
  name: string
  message: string
  category: LintRuleFlag
}
// 以规则区分
export type LintIssuesReport = {
  [K: string]: IssueReport[]
}
export type FormatedIssueReport = IssueReport & {
  rule: string
  isChildIssue?: boolean
  actualElementId?: string
}
// 以元素id区分
export type FormatedIssuesReport = {
  [K: string]: FormatedIssueReport[]
}

const LOW_PRIORITY = 500

const emptyConfig = {
  resolver: {
    resolveRule: function () {
      throw new Error()
    },
    resolveConfig: function () {
      throw new Error()
    }
  },
  config: {}
}

class BpmnLinting {
  static $inject: string[]
  private _modeler: Modeler
  private _canvas: Canvas
  private _elementRegistry: ElementRegistry
  private _eventBus: EventBus
  private _translate: typeof Translate

  private _issues: FormatedIssuesReport
  private _active: boolean
  private _linterConfig: LintConfig['bpmnlint']
  private _issuesCount: Record<'error' | 'warn' | 'info', number>

  constructor(
    bpmnjs: Modeler,
    canvas: Canvas,
    config: LintConfig,
    elementRegistry: ElementRegistry,
    eventBus: EventBus,
    translate: typeof Translate
  ) {
    this._modeler = bpmnjs
    this._canvas = canvas
    this._elementRegistry = elementRegistry
    this._eventBus = eventBus
    this._translate = translate

    this._active = (config && config.active) || false
    this._linterConfig = emptyConfig
    this._issues = {}
    this._issuesCount = {
      error: 0,
      warn: 0,
      info: 0
    }

    const updateLint = debounce({ delay: 0, trailing: true }, () => this.update())

    eventBus.on(
      ['import.done', 'elements.changed', 'linting.configChanged', 'linting.toggle'],
      LOW_PRIORITY,
      updateLint
    )

    eventBus.on('linting.toggle', (event: any) => {
      const active = event.active
      if (!active) {
        this._clearIssues()
      }
    })

    eventBus.on('diagram.clear', () => {
      this._clearIssues()
    })

    const linterConfig = config && config.bpmnlint

    linterConfig &&
      eventBus.once('diagram.init', () => {
        if (this.getLinterConfig() !== emptyConfig) {
          return
        }
        try {
          this.setLinterConfig(linterConfig)
        } catch (err) {
          console.error('[bpmnlint] Invalid lint rules configured. ')
        }
      })
  }

  setLinterConfig(linterConfig: LintConfig['bpmnlint']) {
    if (!linterConfig || !linterConfig.config || !linterConfig.resolver) {
      throw new Error('Expected linterConfig = { config, resolver }')
    }
    this._linterConfig = linterConfig
    this._eventBus.fire('linting.configChanged')
  }
  getLinterConfig() {
    return this._linterConfig
  }

  _formatIssues(issues: LintIssuesReport): FormatedIssuesReport {
    this._clearIssuesCount()

    // (1) reduce issues to flat list of issues including the affected element
    let reports: FormatedIssueReport[] = []
    for (const issuesKey in issues) {
      issues[issuesKey].forEach((i: IssueReport) => {
        ;(i as FormatedIssueReport).rule = issuesKey
        i.category === 'error' && this._issuesCount.error++
        i.category === 'warn' && this._issuesCount.warn++
        i.category === 'info' && this._issuesCount.info++
        reports.push(i as FormatedIssueReport)
      })
    }

    // (2) if affected element is not visible, then report it on root or participant level
    const participants = this._elementRegistry.filter((ele) => {
        return is(ele, 'bpmn:Participant')
      }),
      participantBos = participants.map((ele) => {
        return ele.businessObject
      })

    reports = reports.map((report) => {
      const element = this._elementRegistry.get(report.id)

      if (!element) {
        report.isChildIssue = true
        report.actualElementId = report.id

        const referringParticipant = participantBos.filter(
          (ele) => ele.processRef && ele.processRef.id && ele.processRef.id === report.id
        )

        report.id = referringParticipant.length
          ? referringParticipant[0].id
          : this._canvas.getRootElement().id
        report.name = referringParticipant.length
          ? referringParticipant[0].name
          : this._canvas.getRootElement().name
      } else {
        report.name = element.businessObject.name
      }

      return report
    })

    // (3) group issues per elementId (resulting in ie. [elementId1: [{issue1}, {issue2}]] structure)
    return groupBy(reports, (report) => report.id)
  }

  _updateIssuesMarker(oldIssues: FormatedIssuesReport, newIssues: FormatedIssuesReport) {
    const canvas = this._canvas
    const registry = this._elementRegistry

    const remove: Record<string, any> = {}
    const add: Record<string, any> = {}

    for (const id1 in oldIssues) {
      if (!newIssues[id1]) {
        remove[id1] = oldIssues[id1]
        const el = registry.get(id1) as BpmnElement
        el && canvas.removeMarker(el, 'lint_has-error')
      }
    }

    for (const id2 in newIssues) {
      if (!oldIssues[id2]) {
        add[id2] = newIssues[id2]
      }
      const el = registry.get(id2) as BpmnElement
      el && !canvas.hasMarker(el, 'lint_has-error') && canvas.addMarker(el, 'lint_has-error')
    }
  }

  _clearIssuesCount() {
    this._issuesCount = {
      error: 0,
      warn: 0,
      info: 0
    }
  }
  _clearIssues() {
    this._issues = {}
    this._clearIssuesCount()
  }

  lint(): Promise<LintIssuesReport> {
    const definitions = this._modeler.getDefinitions()
    const linter = new Linter(this._linterConfig)
    return linter.lint(definitions)
  }

  async update() {
    const definitions = this._modeler.getDefinitions()
    if (!definitions) {
      return
    }
    const issues = await this.lint()
    const formatedIssues = this._formatIssues(issues)

    this._updateIssuesMarker(this._issues, formatedIssues)

    this._issues = formatedIssues

    this._eventBus.fire('bpmn-linting.completed', {
      issues: formatedIssues,
      count: this._issuesCount
    })
  }
}

BpmnLinting.$inject = [
  'bpmnjs',
  'canvas',
  'config.linting',
  'elementRegistry',
  'eventBus',
  'translate'
]

export default BpmnLinting
