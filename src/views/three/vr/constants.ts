import * as THREE from 'three'
import type { LoadSphere, PointEntity } from './core/interface'

export const POINTS_RESOURCE: PointEntity[] = [
  {
    position: new THREE.Vector3(-0.5215996364111843, 0.030611924951833763, -0.22710476357669845),
    title: '跳转点1',
    type: 'jumper',
    targetId: '1'
  },
  {
    position: new THREE.Vector3(0.5215996364111843, 0.030611924951833763, -0.22710476357669845),
    title: '跳转点2',
    type: 'jumper',
    targetId: '1'
  },
  {
    position: new THREE.Vector3(0.9, 0, 0),
    title: '信息点2',
    type: 'detail'
  },
  {
    position: new THREE.Vector3(-0.9, 0, 0),
    title: '信息点3',
    type: 'detail'
  },
  {
    position: new THREE.Vector3(-0.6596540733370381, -0.31157185787764863, -0.2739032669874493),
    title: '信息点4',
    targetId: '1',
    type: 'move'
  }
]

export const SUB_POINTS_RESOURCE: PointEntity[] = [
  {
    position: new THREE.Vector3(-1.2993116085838226, 0.030611924951833763, 0.6791617323100382),
    title: '另一个房间1',
    type: 'jumper',
    targetId: '0'
  },
  {
    position: new THREE.Vector3(-1.4287847491418886, 0.0013737592832263447, -0.026770955146551922),
    title: '另一个房间2',
    type: 'detail'
  }
]

export const ROOM_0: LoadSphere = {
  id: '0',
  url: '/textures/room2.jpg',
  anchorPoint: new THREE.Vector3(0.1, 0, 0),
  position: new THREE.Vector2(120, 50),
  center: new THREE.Vector3(0, 0, 0)
}

export const ROOM_1: LoadSphere = {
  id: '1',
  url: '/textures/room2.webp',
  anchorPoint: new THREE.Vector3(-2.1, 0, 0),
  position: new THREE.Vector2(80, 35),
  center: new THREE.Vector3(-2, 0, 0)
}
