import * as THREE from 'three'
import MinionBoardView from './MinionBoardView.ts'

enum Layer {
  DROPPABLE_AREA = 0,
  MINION = -0.1,
}

export default class BoardView {
  public mesh: THREE.Object3D
  public placeholderIndex: number = 0

  private scene: THREE.Scene
  private droppableArea: THREE.Mesh
  private minions: MinionBoardView[] = []
  private readonly CARD_SPACING = 160
  private readonly BOARD_Y_POSITION = 1300

  constructor(scene: THREE.Scene) {
    this.scene = scene

    this.mesh = new THREE.Object3D()
    this.mesh.name = 'board'
    scene.add(this.mesh)

    const geometry = new THREE.PlaneGeometry(7.5, 1.5)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0
    })
    
    this.droppableArea = new THREE.Mesh(geometry, material)
    this.droppableArea.name = 'clickableArea'
    this.droppableArea.position.set(0, -0.5, Layer.DROPPABLE_AREA)
    this.mesh.add(this.droppableArea)
  }

  public getBoundingInfo(): { min: THREE.Vector3, max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.droppableArea)
    return { min: box.min, max: box.max }
  }

  /**
   * Play a minion onto the board with a Hearthstone-like entry animation
   * @param minion MinionBoardView to play
   * @param targetX Target x position for the minion
   */
  public summonMinion(minion: MinionBoardView, targetX: number): void {
    // Add the minion to the board
    this.minions.splice(this.placeholderIndex, 0, minion)

    // Arrange minions to set up the correct positioning
    this.arrangeMinions()

    // Perform the play animation
    this.animateMinionPlayEntry(minion)
    // this.arrangeMinions()
    this.removePlaceholder()
  }

  /**
   * Animate a minion being played onto the board
   * @param minion Minion to animate
   */
  private animateMinionPlayEntry(minion: MinionBoardView): void {
    minion.mesh.position.x =
      1920 - ((this.minions.length - 1) * this.CARD_SPACING) / 2 +
      this.placeholderIndex * this.CARD_SPACING
    minion.mesh.position.y = this.BOARD_Y_POSITION - 0.4
    minion.mesh.scale.set(0.35, 0.35, 1)

    // Animate using simple lerp in render loop
    const startScale = 0.35
    const endScale = 0.25
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

  /**
   * Update board layout with a placeholder for a potential new minion
   * @param hoveredCardWidth Width of the card being hovered
   */
  public updatePlaceholderPosition(hoveredCardX: number): void {
    // Determine the placeholder index based on the hovered card's x position
    const totalWidth = (this.minions.length - 1) * this.CARD_SPACING
    const startX = 960 - totalWidth / 2

    // Find the index where the card should be inserted
    const newPlaceholderIndex = this.minions.findIndex((minion) => {
      const minionX = startX + this.minions.indexOf(minion) * this.CARD_SPACING
      return hoveredCardX < minionX
    })

    // Set the placeholder index (or last position if not found)
    this.placeholderIndex =
      newPlaceholderIndex === -1 ? this.minions.length : newPlaceholderIndex

    // Animate minions to make space
    this.arrangeMinions(true)
  }

  /**
   * Remove the placeholder and reset minion positions
   */
  public removePlaceholder(): void {
    this.placeholderIndex = -1
    // this.arrangeMinions()
  }

  /**
   * Set the entire hand data at once, replacing any existing cards
   * @param minions Array of MinionBoardView instances to set in the hand
   */
  public setBoardData(minions: MinionBoardView[]): void {
    this.minions.forEach((minion) => minion.dispose())

    this.minions = minions
    this.arrangeMinions()
  }

  /**
   * Add a single card to the hand
   * @param minion MinionBoardView to add to the hand
   */
  public addMinion(minion: MinionBoardView): void {
    this.minions.push(minion)
    this.arrangeMinions()
  }

  /**
   * Remove a specific card from the hand
   * @param minion MinionBoardView to remove
   */
  public removeMinion(minion: MinionBoardView): void {
    const index = this.minions.indexOf(minion)
    if (index !== -1) {
      this.minions.splice(index, 1)
      minion.dispose()
      this.arrangeMinions()
    }
  }

  /**
   * Arrange cards in a horizontal line with even spacing
   * @param withPlaceholder Whether to include a placeholder space
   */
  private arrangeMinions(withPlaceholder: boolean = false): void {
    const actualMinionCount = withPlaceholder
      ? this.minions.length + 1
      : this.minions.length

    const totalWidth = (actualMinionCount - 1) * this.CARD_SPACING
    const startX = 1920 - totalWidth / 2

    this.minions.forEach((minion, index) => {
      this.mesh.add(minion.mesh)
      minion.mesh.position.y = this.BOARD_Y_POSITION
      minion.mesh.position.z = Layer.MINION
      minion.transformToBoard()

      // Adjust x position if placeholder is active
      let adjustedIndex = index
      if (withPlaceholder && index >= this.placeholderIndex) {
        adjustedIndex++
      }

      const xPosition = startX + adjustedIndex * this.CARD_SPACING

      // Animate position change
      this.animateMinionPosition(minion, xPosition)
    })
  }

  /**
   * Animate a minion to a new position
   * @param minion Minion to animate
   * @param targetX Target x position
   */
  private animateMinionPosition(
    minion: MinionBoardView,
    targetX: number
  ): void {
    const startX = minion.mesh.position.x
    const duration = 250 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out function
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const currentX = startX + (targetX - startX) * easeProgress
      minion.mesh.position.x = currentX
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  /**
   * Get the number of cards currently in the hand
   */
  public get minionCount(): number {
    return this.minions.length
  }

  /**
   * Dispose of all cards and clear the hand
   */
  public clear(): void {
    this.minions.forEach((card) => card.dispose())
    this.minions = []
  }
}
