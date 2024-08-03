export interface PointEntity {
  position: THREE.Vector3
  title: string
  url?: string
  type: 'detail' | 'jumper' | 'move'
  targetId?: string
}

export interface LoadSphere {
  readonly id: string
  url: string
  name: string
  position?: THREE.Vector2
  anchorPoint: THREE.Vector3
  center?: THREE.Vector3
  points: PointEntity[]
}
export interface VrRoomOptions {
  container: HTMLCanvasElement
  // 所有场景
  scenes: LoadSphere[]
  // 起始场景ID
  currentSceneID: string
  cameraPosition: THREE.Vector3
  cameraLookAt: THREE.Vector3
  debugger?: boolean
  // 缩放配置
  allowScale?: boolean
  minScale?: number
  maxScale?: number
}

export interface LoadingProgressEntity {
  url: string
  itemsLoaded: number
  itemsTotal: number
  progress: number
  loadingState?: string
  status?: 'normal' | 'success' | 'warning' | 'danger'
}

export interface LoadPoints {
  readonly id: string
  points: PointEntity[]
}
