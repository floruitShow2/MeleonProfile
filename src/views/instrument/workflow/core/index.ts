import EventEmitter from 'events'
import { Edge, GraphEdge, useVueFlow } from '@vue-flow/core'
import type { AddNodes, AddEdges, Connection, Node, GraphNode } from '@vue-flow/core'
import { WorkFlowEvents } from './output'

export default class WorkflowCore extends EventEmitter {
  // 预览容器的尺寸信息
  wrapperRect!: Record<string, number>

  // 节点数量
  private nodes!: Node[]

  get nodesLength() {
    return this.nodes.length
  }

  // 线条数量
  private edges!: Edge[]

  get edgesLength() {
    return this.edges.length
  }

  activeId!: string

  // activeNode!: GraphNode

  // activeEdge!: GraphEdge

  private addNodes!: AddNodes

  private addEdges!: AddEdges

  constructor() {
    super()
    this.nodes = [
      // Nodes
      // An input node, specified by using `type: 'input'`
      { id: 'node-1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 } },

      // Default nodes, you can omit `type: 'default'`
      { id: 'node-2', label: 'Node 2', position: { x: 100, y: 100 } },
      { id: 'node-3', label: 'Node 3', position: { x: 400, y: 100 } },

      // An output node, specified by using `type: 'output'`
      { id: 'node-4', type: 'output', label: 'Node 4', position: { x: 400, y: 200 } }
    ]

    this.edges = [
      // Edges
      // Most basic edge, only consists of an id, source-id and target-id
      { id: 'edge-1', source: 'node-1', type: 'smoothstep', target: 'node-3' },
      { id: 'edge-2', source: 'node-3', type: 'smoothstep', target: 'node-4' },

      // An animated edge
      { id: 'edge-3', source: 'node-1', type: 'smoothstep', target: 'node-2', animated: true }
    ]

    const { addNodes, addEdges, onNodeDrag, onNodeDragStop, getNodes } = useVueFlow({
      nodes: this.nodes,
      edges: this.edges
    })

    this.addNodes = addNodes
    this.addEdges = addEdges

    onNodeDrag(({ intersections }) => {
      const ids = (intersections || [])
        .filter((intersection) => intersection.type === 'nest')
        .map((intersection) => intersection.id)
      getNodes.value.forEach((node) => {
        node.class = ids.includes(node.id) ? 'isIntersecting' : ''
      })
    })
    onNodeDragStop(({ intersections, nodes }) => {
      if (!intersections) return
      let parentId = ''
      intersections
        .filter((intersection) => intersection.type === 'nest')
        .forEach((intersection) => {
          intersection.class = ''
          parentId = intersection.id
        })
      nodes.forEach((node) => {
        node.parentNode = parentId
        node.extent = 'parent'
      })
    })
  }

  /**
   * @description 更新容器的尺寸信息
   * @param wrapper 渲染容器的DOM节点
   */
  updateWrapperSize(wrapper: HTMLElement) {
    const { width, height, left, top } = wrapper.getBoundingClientRect()
    this.wrapperRect = {
      width,
      height,
      left,
      top
    }
  }

  /**
   * 插入节点
   * @param type 节点类型
   * @param x 插入位置的横坐标
   * @param y 插入位置的纵坐标
   */
  insertFlowNode(type: WorkFlow.NodeType, x?: number, y?: number) {
    if (!x) x = this.wrapperRect.width / 2 || 100
    if (!y) y = this.wrapperRect.height / 2 || 100

    const id = `node-${this.nodesLength + 1}`

    let nodeData: Node | null = null

    switch (type) {
      case 'upload':
        nodeData = {
          id,
          type,
          label: type,
          position: { x, y },
          data: { title: '文件上传', delete: false }
        }
        break
      default:
        nodeData = {
          id,
          type,
          label: type,
          position: { x, y }
        }
        break
    }

    if (!nodeData) return
    this.nodes.push(nodeData)
    this.addNodes(nodeData)
    this.updateActiveNode(id)
  }

  /**
   * @description 更新当前激活的节点信息，并触发 id更新 和 节点更新 事件
   * @param nodeOrId 可以是完整的节点信息，也可以是节点的 ID
   */
  updateActiveNode(nodeOrId: GraphNode | Node | string) {
    if (typeof nodeOrId === 'string') this.activeId = nodeOrId
    else {
      const findIdx = this.nodes.findIndex((node) => node.id === nodeOrId.id)
      if (findIdx === -1) return
      this.nodes.splice(findIdx, 1, nodeOrId)
      this.activeId = nodeOrId.id
    }
    this.emit(WorkFlowEvents.onANC, this.activeId)
    this.emit(WorkFlowEvents.onAIDC, this.activeId)
  }

  insertFlowEdge(edge: Connection) {
    const id = `edge-${this.edgesLength + 1}`
    const newEdge = { id, type: 'edInput', data: { inputType: 'input' }, ...edge }
    this.edges.push(newEdge)
    this.addEdges(newEdge)
    this.updateActiveEdge(id)
  }

  updateActiveEdge(edgeOrId: GraphEdge | Edge | string) {
    if (typeof edgeOrId === 'string') this.activeId = edgeOrId
    else {
      const findIdx = this.edges.findIndex((edge) => edge.id === edgeOrId.id)
      if (findIdx === -1) return
      this.edges.splice(findIdx, 1, edgeOrId)
      this.activeId = edgeOrId.id
    }
    this.emit(WorkFlowEvents.onAIDC, this.activeId)
  }

  // 基于 ID 查询到对应的 Node 和 Edge 元素
  getActiveElement(id?: string) {
    const findNode = this.getActiveNode(id)
    const findEdge = this.getActiveEdge(id)
    if (findNode) return findNode
    if (findEdge) return findEdge
    return null
  }

  getActiveNode(id?: string): Node | undefined {
    return this.nodes.find((node) => node.id === (id || this.activeId))
  }

  getActiveEdge(id?: string): Edge | undefined {
    return this.edges.find((edge) => edge.id === (id || this.activeId))
  }
}
