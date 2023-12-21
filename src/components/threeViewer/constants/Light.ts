import * as Three from 'three'
import type { SunLightOptions } from '../interface/light'

export const DefaultSunLightOptions: SunLightOptions = {
  color: new Three.Color(255, 255, 255),
  intensity: 0.1,
  showHelper: true,
  position: new Three.Vector3(5, 15, 5)
}
