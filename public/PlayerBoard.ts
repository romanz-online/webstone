import * as THREE from 'three'
import { DragEvent, Draggable, DropZone } from './Draggable.ts'
import MinionBoard from './MinionBoard.ts'
import MinionCard from './MinionCard.ts'
import { CardType, EventType, PlayerID } from './constants.ts'
import { Layer } from './gameConstants.ts'
import { triggerWsEvent } from './main.ts'

export default class PlayerBoard implements DropZone {
  public mesh: THREE.Object3D
  public placeholderIndex: number = -1

  private scene: THREE.Scene
  private droppableArea: THREE.Mesh
  private minions: MinionBoard[] = []
  private readonly CARD_SPACING = 1.5
  private readonly BOARD_Y_POSITION = -0.5

  constructor(scene: THREE.Scene) {
    this.scene = scene

    this.mesh = new THREE.Object3D()
    this.mesh.name = 'board'
    scene.add(this.mesh)

    const geometry = new THREE.PlaneGeometry(7.5, 1.5)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    })

    this.droppableArea = new THREE.Mesh(geometry, material)
    this.droppableArea.name = 'clickableArea'
    this.droppableArea.position.set(0, -0.5, Layer.BOARD)
    this.mesh.add(this.droppableArea)
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.droppableArea)
    return { min: box.min, max: box.max }
  }

  public summonMinion(minion: MinionBoard): void {
    // Add the minion to the board
    this.minions.splice(this.placeholderIndex, 0, minion)

    // Arrange minions to set up the correct positioning
    this.arrangeMinions(false)

    // Perform the play animation
    this.animateMinionPlayEntry(minion)
    // this.arrangeMinions()
    this.removePlaceholder()
  }

  private animateMinionPlayEntry(minion: MinionBoard): void {
    minion.mesh.position.x =
      -((this.minions.length - 1) * this.CARD_SPACING) / 2 +
      this.placeholderIndex * this.CARD_SPACING
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

  public updatePlaceholderPosition(worldX: number, worldY: number): void {
    // Convert world coordinates to board-relative coordinates
    const worldPosition = new THREE.Vector3(worldX, worldY, 0)
    const localPosition = this.mesh.worldToLocal(worldPosition)

    // Use the local X position for determining placement
    const hoveredCardX = localPosition.x

    // Determine the placeholder index based on the hovered card's x position
    const totalWidth = (this.minions.length - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

    // Find the index where the card should be inserted
    const newPlaceholderIndex = this.minions.findIndex((minion) => {
      const minionX = startX + this.minions.indexOf(minion) * this.CARD_SPACING
      return hoveredCardX < minionX
    })

    // Set the placeholder index (or last position if not found)
    const calculatedIndex =
      newPlaceholderIndex === -1 ? this.minions.length : newPlaceholderIndex

    // Only update if placeholder position actually changed to avoid unnecessary animations
    if (this.placeholderIndex !== calculatedIndex) {
      this.placeholderIndex = calculatedIndex
      this.arrangeMinions(true)
    }
  }

  public removePlaceholder(): void {
    this.placeholderIndex = -1
    this.arrangeMinions()
  }

  public setBoardData(minions: MinionBoard[]): void {
    this.minions.forEach((minion) => minion.dispose())

    this.minions = minions
    this.arrangeMinions()
  }

  public addMinion(minion: MinionBoard): void {
    this.minions.push(minion)
    this.arrangeMinions()
  }

  public removeMinion(minion: MinionBoard): void {
    const index = this.minions.indexOf(minion)
    if (index !== -1) {
      this.minions.splice(index, 1)
      minion.dispose()
      this.arrangeMinions()
    }
  }

  private arrangeMinions(withPlaceholder: boolean = false): void {
    const actualMinionCount = withPlaceholder
      ? this.minions.length + 1
      : this.minions.length

    const totalWidth = (actualMinionCount - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

    this.minions.forEach((minion, index) => {
      // Only add to mesh if not already a child to prevent re-parenting
      if (minion.mesh.parent !== this.mesh) {
        this.mesh.add(minion.mesh)
      }

      minion.mesh.position.y = this.BOARD_Y_POSITION
      minion.mesh.position.z = Layer.BOARD_MINION

      // Adjust x position if placeholder is active and valid
      let adjustedIndex = index
      if (
        withPlaceholder &&
        this.placeholderIndex >= 0 &&
        index >= this.placeholderIndex
      ) {
        adjustedIndex++
      }

      const xPosition = startX + adjustedIndex * this.CARD_SPACING

      // Animate position change
      this.animateMinionPosition(minion, xPosition)
    })
  }

  private animateMinionPosition(minion: MinionBoard, targetX: number): void {
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

  public canAcceptDrop(draggable: Draggable): boolean {
    return draggable instanceof MinionCard
  }

  public onDrop(draggable: Draggable, event: DragEvent): void {
    if (draggable instanceof MinionCard) {
      console.log('Card was dropped on board in place', this.placeholderIndex)

      triggerWsEvent(EventType.TryPlayCard, {
        cardType: CardType.Minion,
        boardIndex: this.placeholderIndex,
        minionID: draggable.minion.id,
        playerID: PlayerID.Player1,
      })

      // Create a new minion for the board
      // const newMinion = new MinionBoard(this.scene, draggable.minion)

      // Summon the minion at the placeholder position
      // this.summonMinion(newMinion)
    }
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
