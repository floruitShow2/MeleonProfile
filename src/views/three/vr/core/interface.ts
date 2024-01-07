export interface PointEntity {
  position: THREE.Vector3
  title: string
  url?: string
  type: 'detail' | 'jumper' | 'move'
  targetUrl?: string
}

export interface VrRoomOptions {
  container: HTMLCanvasElement
  cameraPosition: THREE.Vector3
  cameraLookAt: THREE.Vector3
  debugger?: boolean
}

export interface LoadSphere {
  url: string
}

export interface LoadPoints {
  points: PointEntity[]
}
