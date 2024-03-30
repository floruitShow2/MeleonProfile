export interface CameraOptions {
  cameraAt: THREE.Vector3
}

export interface InstanceOptions {
  canvas: HTMLCanvasElement
  wrapper: HTMLElement
  cameraOptions?: CameraOptions
}
