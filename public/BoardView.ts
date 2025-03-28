import * as BABYLON from 'babylonjs'
import MinionBoardView from './MinionBoardView.ts'

enum Layer {
  DROPPABLE_AREA = 0,
  MINION = -0.1,
}

export default class BoardView {
  public mesh: BABYLON.TransformNode

  private scene: BABYLON.Scene
  private minions: MinionBoardView[] = []
  private readonly CARD_SPACING = 1.1
  private readonly BOARD_Y_POSITION = -0.5

  constructor(scene: BABYLON.Scene) {
    this.scene = scene

    this.mesh = new BABYLON.TransformNode('board', this.scene)

    const clickableAreaMesh = BABYLON.MeshBuilder.CreatePlane(
      'clickableArea',
      {
        width: 7.5,
        height: 1.5,
      },
      this.scene
    )
    clickableAreaMesh.parent = this.mesh
    clickableAreaMesh.position.y = -0.5
    clickableAreaMesh.position.z = Layer.DROPPABLE_AREA

    const transparentMaterial = new BABYLON.StandardMaterial(
      'transparentMaterial',
      this.scene
    )

    transparentMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0)
    transparentMaterial.alpha = 0.5 // 0
    clickableAreaMesh.material = transparentMaterial
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
   */
  private arrangeMinions(): void {
    const totalWidth = (this.minions.length - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

    this.minions.forEach((minion, index) => {
      minion.mesh.parent = this.mesh
      minion.transformToBoard()

      const xPosition = startX + index * this.CARD_SPACING

      minion.mesh.position.set(xPosition, this.BOARD_Y_POSITION, Layer.MINION)
    })
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
