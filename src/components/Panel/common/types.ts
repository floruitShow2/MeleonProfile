export type InitRef<T> = undefined | T

export type AssigneeType = 'idm' | 'static'
export type IdmAssigneeType = 'specify' | 'candidate' | 'starter'

export type MultiInstanceType = 'None' | 'Parallel' | 'Serial'

export type NextUser = {
  name?: string
  code?: string
  multiple?: boolean
}
export type NextFlow = {
  name?: string
  code?: string
}

export type ScriptFormat = 'groovy' | 'JavaScript' | 'juel'

export type CalledElementType = 'key' | 'id'

export type IOParams = {
  source?: string
  target?: string
  sourceExpression?: string
  variables?: string
}

export type HttpPrams = {
  key?: string
  value?: string
}

export type ExpTimeMode = {
  custom: boolean
  mode?: string
  num?: number
  value?: string | number
  customValue?: string
}
