import type { InjectionKey, ShallowRef } from 'vue'
import type Modeler from 'bpmn-js/lib/Modeler'

export const modelerKey: InjectionKey<ShallowRef<Modeler | undefined>> = Symbol()

export const currentElementKey: InjectionKey<ShallowRef<BpmnElement | undefined>> = Symbol()

export const processBaseKey: InjectionKey<ShallowRef<{ id: string; name: string } | undefined>> =
  Symbol()

export const getModuleKey: InjectionKey<<T>(moduleName: string) => T> = Symbol()
