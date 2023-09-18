declare namespace WorkFlow {
  // 节点类型定义
  type NodeType = 'code' | 'text' | 'upload' | 'param' | 'input' | 'output' | 'nest'
  interface NodeGroups {
    base: NodeType[]
  }
}
