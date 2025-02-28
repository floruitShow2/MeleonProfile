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
    position: new THREE.Vector3(0.6491931650918973, -0.30068038930581054, 0.6446038327644302),
    title: '移动点',
    targetId: '1',
    type: 'move'
  }
]

export const SUB_POINTS_RESOURCE: PointEntity[] = [
  {
    position: new THREE.Vector3(-0.6596540733370381, -0.31157185787764863, -0.2739032669874493),
    title: '另一个房间1',
    type: 'jumper',
    targetId: '0'
  },
  {
    position: new THREE.Vector3(-0.9, 0, 0),
    title: '另一个房间2',
    type: 'detail'
  }
]

export const ROOM_0: LoadSphere = {
  id: '0',
  name: '房间1',
  url: 'https://dragonir.github.io/panorama-advanced/assets/map_living_room-10de3e48.jpg',
  anchorPoint: new THREE.Vector3(0.1, 0, 0),
  position: new THREE.Vector2(120, 50),
  points: POINTS_RESOURCE
}

export const ROOM_1: LoadSphere = {
  id: '1',
  name: '房间2',
  url: 'https://dragonir.github.io/panorama-advanced/assets/map_living_room_out-7720bdad.jpg',
  anchorPoint: new THREE.Vector3(-2.1, 0, 0),
  position: new THREE.Vector2(80, 35),
  points: SUB_POINTS_RESOURCE
}
