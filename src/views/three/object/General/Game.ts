import * as THREE from 'three'
import GSAP from 'gsap'
import Block from './Block'
import Stage from './Stage'
import type { BlockReturn } from '../type'

class Game {
  STATES: Record<string, string> = {
    LOADING: 'loading',
    PLAYING: 'playing',
    READY: 'ready',
    ENDED: 'ended',
    RESETTING: 'resetting'
  }

  state: string = this.STATES.LOADING

  blocks: Block[] = []

  stage!: Stage

  newBlocks!: THREE.Group

  placedBlocks!: THREE.Group

  choppedBlocks!: THREE.Group

  constructor(wrapper: HTMLCanvasElement) {
    this.stage = new Stage(wrapper)

    this.newBlocks = new THREE.Group()
    this.placedBlocks = new THREE.Group()
    this.choppedBlocks = new THREE.Group()
    this.stage.add(this.newBlocks, this.placedBlocks, this.choppedBlocks)

    this.addBlock()
    this.tick()

    this.updateState(this.STATES.READY)

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.onAction()
    })

    document.addEventListener('click', (e) => {
      this.onAction()
    })
  }

  addBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1]

    if (lastBlock && lastBlock.state === lastBlock.STATES.MISSED) {
      this.endGame()
      return
    }

    const newKidOnTheBlock = new Block(lastBlock)
    this.newBlocks.add(newKidOnTheBlock.mesh)
    this.blocks.push(newKidOnTheBlock)

    this.stage.setCamera(this.blocks.length * 2)
  }

  placeBlock() {
    const currentBlock = this.blocks[this.blocks.length - 1]
    const newBlocks: BlockReturn = currentBlock.place()
    this.newBlocks.remove(currentBlock.mesh)
    if (newBlocks.placed) this.placedBlocks.add(newBlocks.placed)
    if (newBlocks.chopped) {
      this.choppedBlocks.add(newBlocks.chopped)
      const positionParams = {
        x: '',
        z: '',
        y: '-=30',
        ease: Power1.easeIn,
        onComplete: () => {
          this.choppedBlocks.remove(newBlocks.chopped)
        }
      }
      const rotateRandomness = 10
      const rotationParams = {
        delay: 0.05,
        x: newBlocks.plane === 'z' ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
        z: newBlocks.plane === 'x' ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
        y: Math.random() * 0.1
      }
      if (
        newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]
      ) {
        positionParams[newBlocks.plane] = `+=${40 * Math.abs(newBlocks.direction)}`
      } else {
        positionParams[newBlocks.plane] = `-=${40 * Math.abs(newBlocks.direction)}`
      }
      GSAP.to(newBlocks.chopped.position, 1, positionParams)
      GSAP.to(newBlocks.chopped.rotation, 1, rotationParams)
    }

    this.addBlock()
  }

  tick() {
    this.blocks[this.blocks.length - 1].tick()
    this.stage.render()
    requestAnimationFrame(() => {
      this.tick()
    })
  }

  updateState(newState: string) {
    this.state = newState
  }

  onAction() {
    switch (this.state) {
      case this.STATES.READY:
        this.startGame()
        break
      case this.STATES.PLAYING:
        this.placeBlock()
        break
      case this.STATES.ENDED:
        this.restartGame()
        break
      default:
        break
    }
  }

  startGame() {
    if (this.state !== this.STATES.PLAYING) {
      this.updateState(this.STATES.PLAYING)
      this.addBlock()
    }
  }

  restartGame() {
    console.log(this)
  }

  endGame() {
    this.updateState(this.STATES.ENDED)
  }
}

export default Game
