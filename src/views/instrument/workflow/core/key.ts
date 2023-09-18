import { InjectionKey } from 'vue'
import Workflow from './index'

const workflowInjectionKey: InjectionKey<Workflow> = Symbol('WsWorkflow')

export { workflowInjectionKey }
