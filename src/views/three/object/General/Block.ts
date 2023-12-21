import * as THREE from 'three'
import type { BlockReturn } from '../type'

class Block {
  MOVE_AMOUNT = 12

  STATES = {
    ACTIVE: 'active',
    STOPPED: 'stopped',
    MISSED: 'missed'
  }

  state!: string

  dimension = { width: 0, height: 0, depth: 0 }

  position = { x: 0, y: 0, z: 0 }

  index!: number

  // 方块进入的方向
  workingPlane!: 'x' | 'z'

  workingDimension!: 'width' | 'depth'

  colorOffset!: number

  color!: THREE.Color | number

  speed!: number

  direction!: number

  material!: THREE.Material

  mesh: THREE.Mesh

  // eslint-disable-next-line
  targetBlock!: Block

  constructor(block: Block) {
    this.targetBlock = block
    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1
    this.workingPlane = this.index % 2 ? 'x' : 'z'
    this.workingDimension = this.index % 2 ? 'width' : 'depth'

    // 与上一个方块切割后剩余的尺寸相同
    this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10
    this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2
    this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10

    // x、z轴的位置与上一个方块保持一致，y轴位置则与 block 的索引相关
    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0
    this.position.y = this.dimension.height * this.index
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0

    this.colorOffset = this.targetBlock
      ? this.targetBlock.colorOffset
      : Math.round(Math.random() * 100)

    // set color
    if (!this.targetBlock) {
      this.color = 0xffffff
    } else {
      const offset = this.index + this.colorOffset
      const r = Math.sin(0.3 * offset) * 55 + 200
      const g = Math.sin(0.3 * offset + 2) * 55 + 200
      const b = Math.sin(0.3 * offset + 4) * 55 + 200
      this.color = new THREE.Color(r / 255, g / 255, b / 255)
    }

    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED

    this.speed = -0.1 - this.index * 0.005
    if (this.speed < -4) this.speed = -4
    this.direction = this.speed

    const geometry = new THREE.BoxGeometry(
      this.dimension.width,
      this.dimension.height,
      this.dimension.depth
    )
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        this.dimension.width / 2,
        this.dimension.height / 2,
        this.dimension.depth / 2
      )
    )
    this.material = new THREE.MeshPhongMaterial({ color: this.color })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.set(
      this.position.x,
      this.position.y + (this.state === this.STATES.ACTIVE ? 0 : 0),
      this.position.z
    )

    if (this.state === this.STATES.ACTIVE) {
      this.position[this.workingPlane] = Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT
    }
  }

  reverseDirection() {
    this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed)
  }

  tick() {
    // 未放置 block 的动画效果
    if (this.state === this.STATES.ACTIVE) {
      const value = this.position[this.workingPlane]
      if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) this.reverseDirection()
      this.position[this.workingPlane] += this.direction
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane]
    }
  }

  place(): BlockReturn {
    this.state = this.STATES.STOPPED

    let overlap =
      this.targetBlock.dimension[this.workingDimension] -
      Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane])

    const blocksToReturn: BlockReturn = {
      plane: this.workingPlane,
      direction: this.direction
    }

    if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension]
      blocksToReturn.bonus = true
      this.position.x = this.targetBlock.position.x
      this.position.z = this.targetBlock.position.z
      this.dimension.width = this.targetBlock.dimension.width
      this.dimension.depth = this.targetBlock.dimension.depth
    }

    if (overlap > 0) {
      const choppedDimensions = {
        width: this.dimension.width,
        height: this.dimension.height,
        depth: this.dimension.depth
      }
      choppedDimensions[this.workingDimension] -= overlap
      this.dimension[this.workingDimension] = overlap

      const placedGeometry = new THREE.BoxGeometry(
        this.dimension.width,
        this.dimension.height,
        this.dimension.depth
      )
      placedGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
          this.dimension.width / 2,
          this.dimension.height / 2,
          this.dimension.depth / 2
        )
      )
      const placedMesh = new THREE.Mesh(placedGeometry, this.material)

      const choppedGeometry = new THREE.BoxGeometry(
        choppedDimensions.width,
        choppedDimensions.height,
        choppedDimensions.depth
      )
      choppedGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
          choppedDimensions.width / 2,
          choppedDimensions.height / 2,
          choppedDimensions.depth / 2
        )
      )
      const choppedMesh = new THREE.Mesh(choppedGeometry, this.material)

      const choppedPosition = {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      }

      if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {
        this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane]
      } else {
        choppedPosition[this.workingPlane] += overlap
      }

      placedMesh.position.set(this.position.x, this.position.y, this.position.z)
      choppedMesh.position.set(choppedPosition.x, choppedPosition.y, choppedPosition.z)

      blocksToReturn.placed = placedMesh
      if (!blocksToReturn.bonus) blocksToReturn.chopped = choppedMesh
    } else {
      this.state = this.STATES.MISSED
    }

    this.dimension[this.workingDimension] = overlap

    return blocksToReturn
  }
}

export default Block
