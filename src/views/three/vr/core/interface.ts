export interface PointEntity {
  position: THREE.Vector3
  title: string
  url?: string
  type: 'detail' | 'jumper' | 'move'
  targetId?: string
}

export interface VrRoomOptions {
  container: HTMLCanvasElement
  // 起始场景
  currentScene: string
  cameraPosition: THREE.Vector3
  cameraLookAt: THREE.Vector3
  debugger?: boolean
}

export interface LoadingProgressEntity {
  url: string
  itemsLoaded: number
  itemsTotal: number
  progress: number
  loadingState?: string
  status?: 'normal' | 'success' | 'warning' | 'danger'
}

export interface LoadSphere {
  readonly id: string
  url: string
  position: THREE.Vector2
  anchorPoint: THREE.Vector3
  center?: THREE.Vector3
}

export interface LoadPoints {
  readonly id: string
  points: PointEntity[]
}
