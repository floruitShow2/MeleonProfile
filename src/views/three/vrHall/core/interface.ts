export interface VHallOptions {
  container: HTMLCanvasElement
  // debugger 模式
  debugger?: boolean
  // 相机高度
  cameraHeight?: number
  // 相机观看位置
  cameraLookAt: THREE.Vector3
  // 默认相机位置
  cameraPosition: THREE.Vector3
}

export interface LoadHall {
  url: string
  // 地板名称
  floorName?: string
  position?: THREE.Vector3
  scale?: THREE.Vector3
  onProgress?: (progress: ProgressEvent<EventTarget>) => void
}

export type LoadGltf = Pick<LoadHall, 'url' | 'onProgress'>

export interface DrawsEntity {
  url: string
  scale?: THREE.Vector3
  position?: THREE.Vector3
  rotation?: THREE.Vector3
}
