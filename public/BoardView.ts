import * as BABYLON from 'babylonjs'
import MinionBoardView from './MinionBoardView.ts'

enum Layer {
  DROPPABLE_AREA = 0,
  MINION = -0.1,
}

export default class BoardView {
  public mesh: BABYLON.TransformNode
  public placeholderIndex: number = 0

  private scene: BABYLON.Scene
  private droppableArea: BABYLON.Mesh
  private minions: MinionBoardView[] = []
  private readonly CARD_SPACING = 1.1
  private readonly BOARD_Y_POSITION = -0.5

  constructor(scene: BABYLON.Scene) {
    this.scene = scene

    this.mesh = new BABYLON.TransformNode('board', this.scene)

    this.droppableArea = BABYLON.MeshBuilder.CreatePlane(
      'clickableArea',
      {
        width: 7.5,
        height: 1.5,
      },
      this.scene
    )
    this.droppableArea.parent = this.mesh
    this.droppableArea.position.y = -0.5
    this.droppableArea.position.z = Layer.DROPPABLE_AREA

    const transparentMaterial = new BABYLON.StandardMaterial(
      'transparentMaterial',
      this.scene
    )

    transparentMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0)
    transparentMaterial.alpha = 0.5 // 0
    this.droppableArea.material = transparentMaterial
  }

  public getBoundingInfo(): BABYLON.BoundingInfo {
    return this.droppableArea.getBoundingInfo()
  }

  /**
   * Update board layout with a placeholder for a potential new minion
   * @param hoveredCardWidth Width of the card being hovered
   */
  public updatePlaceholderPosition(hoveredCardX: number): void {
    // Determine the placeholder index based on the hovered card's x position
    const totalWidth = (this.minions.length - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

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
    this.arrangeMinions()
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
    const startX = -totalWidth / 2

    this.minions.forEach((minion, index) => {
      minion.mesh.parent = this.mesh
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
    const positionAnimation = new BABYLON.Animation(
      `${minion.mesh.name}_positionAnimation`,
      'position.x',
      20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    )

    const keyFrames = []
    keyFrames.push({ frame: 0, value: minion.mesh.position.x })
    keyFrames.push({ frame: 5, value: targetX })

    positionAnimation.setKeys(keyFrames)

    // Use smooth easing
    const easingFunction = new BABYLON.CircleEase()
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT)
    positionAnimation.setEasingFunction(easingFunction)

    // Stop any existing animations
    this.scene.stopAnimation(minion.mesh)

    // Run the animation
    this.scene.beginDirectAnimation(
      minion.mesh,
      [positionAnimation],
      0,
      5,
      false
    )
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
