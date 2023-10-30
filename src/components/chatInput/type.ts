export type IPerson = Partial<ApiUserManagement.User>

export interface IMention extends Pick<IPerson, 'id' | 'userName'> {
  offset: number
  length: number
}

export enum NodeType {
  text = 'text',
  br = 'br',
  at = 'at'
}

export interface INode {
  type: NodeType
  data: IPerson | string
}
