import * as THREE from 'three'
import type { PointEntity } from './core/interface'

export const POINTS_RESOURCE: PointEntity[] = [
  {
    position: new THREE.Vector3(-0.5215996364111843, 0.030611924951833763, -0.22710476357669845),
    title: '信息点1',
    type: 'jumper',
    targetUrl: '/textures/room2.webp'
  },
  {
    position: new THREE.Vector3(0.9, 0, 0),
    title: '信息点2',
    type: 'detail'
  },
  {
    position: new THREE.Vector3(-0.9683953976880881, -0.5289598479926403, -0.25811663215060304),
    title: '信息点3',
    type: 'move'
  }
]
