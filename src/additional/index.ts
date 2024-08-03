// @ts-ignore
import minimapModule from 'diagram-js-minimap'
// @ts-ignore
import TokenSimulationModule from 'bpmn-js-token-simulation'
// @ts-ignore
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything'

import GridBgModule from 'diagram-js-grid-bg'

import CustomCmd from '@/additional/cmd'
import CustomRenderer from '@/additional/bpmn-renderer'
import CustomRules from '@/additional/rules'
import Providers from '@/additional/providers'
import BpmnReplace from '@/additional/bpmn-replace'
import Translate from '@/additional/translate'
// import BpmnLintModule from '@/additional/lint'
import CustomBpmnLintModule from '@/additional/bpmn-lint'
import CustomPopupMenuModule from '@/additional/popup-menu'

export default [
  minimapModule,
  TokenSimulationModule,
  CreateAppendAnythingModule,

  CustomCmd,
  CustomRenderer,
  CustomRules,
  Providers,
  Translate,
  BpmnReplace,
  GridBgModule,
  // BpmnLintModule,
  CustomBpmnLintModule,
  CustomPopupMenuModule
]
