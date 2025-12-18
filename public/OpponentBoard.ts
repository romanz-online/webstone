import * as THREE from 'three'
import OpponentMinionBoard from './OpponentMinionBoard.ts'
import { Layer } from './gameConstants.ts'

export default class OpponentBoard {
  public mesh: THREE.Object3D

  private minions: OpponentMinionBoard[] = []
  private readonly CARD_SPACING = 1.5
  private readonly BOARD_Y_POSITION = 1.1

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Object3D()
    this.mesh.name = 'opponentBoard'
    scene.add(this.mesh)
  }

  public summonMinion(minion: OpponentMinionBoard, index: number): void {
    // Add the minion to the board
    this.minions.splice(index, 0, minion)

    // Arrange minions to set up the correct positioning
    this.arrangeMinions()

    // Perform the play animation
    this.animateMinionPlayEntry(minion, index)
  }

  private animateMinionPlayEntry(
    minion: OpponentMinionBoard,
    index: number
  ): void {
    minion.mesh.position.x =
      -((this.minions.length - 1) * this.CARD_SPACING) / 2 +
      index * this.CARD_SPACING
    minion.mesh.position.y = this.BOARD_Y_POSITION - 0.4
    minion.mesh.scale.set(0.35, 0.35, 1)

    // Animate using simple lerp in render loop
    const startScale = 0.35
    const endScale = 1.0
    const startY = minion.mesh.position.y
    const endY = this.BOARD_Y_POSITION
    const duration = 150 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out function
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const currentScale = startScale + (endScale - startScale) * easeProgress
      const currentY = startY + (endY - startY) * easeProgress

      minion.mesh.scale.set(currentScale, currentScale, 1)
      minion.mesh.position.y = currentY

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  public setBoardData(minions: OpponentMinionBoard[]): void {
    this.minions.forEach((minion) => minion.dispose())

    this.minions = minions
    this.arrangeMinions()
  }

  public addMinion(minion: OpponentMinionBoard): void {
    this.minions.push(minion)
    this.arrangeMinions()
  }

  public removeMinion(minion: OpponentMinionBoard): void {
    const index = this.minions.indexOf(minion)
    if (index !== -1) {
      this.minions.splice(index, 1)
      minion.dispose()
      this.arrangeMinions()
    }
  }

  private arrangeMinions(): void {
    const totalWidth = (this.minions.length - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

    this.minions.forEach((minion, index) => {
      // Only add to mesh if not already a child to prevent re-parenting
      if (minion.mesh.parent !== this.mesh) {
        this.mesh.add(minion.mesh)
      }

      minion.mesh.position.y = this.BOARD_Y_POSITION
      minion.mesh.position.z = Layer.BOARD_MINION

      const xPosition = startX + index * this.CARD_SPACING

      // Animate position change
      this.animateMinionPosition(minion, xPosition)
    })
  }

  private animateMinionPosition(
    minion: OpponentMinionBoard,
    targetX: number
  ): void {
    // Skip animation if already at target position
    if (Math.abs(minion.mesh.position.x - targetX) < 0.01) {
      return
    }

    const startX = minion.mesh.position.x
    const duration = 200 // ms - slightly faster for more responsive feel
    const startTime = Date.now()

    // Cancel any existing animation for this minion
    if ((minion as any).animationId) {
      cancelAnimationFrame((minion as any).animationId)
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out function
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const currentX = startX + (targetX - startX) * easeProgress
      minion.mesh.position.x = currentX

      if (progress < 1) {
        ;(minion as any).animationId = requestAnimationFrame(animate)
      } else {
        delete (minion as any).animationId
      }
    }

    ;(minion as any).animationId = requestAnimationFrame(animate)
  }

  public clear(): void {
    this.minions.forEach((minion) => {
      // Cancel any ongoing animations
      if ((minion as any).animationId) {
        cancelAnimationFrame((minion as any).animationId)
        delete (minion as any).animationId
      }
      minion.dispose()
    })
    this.minions = []
  }
}
