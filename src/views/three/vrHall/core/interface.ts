export interface VHallOptions {
  container: HTMLCanvasElement
  // 相机高度
  cameraHeight?: number
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
