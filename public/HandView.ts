import * as BABYLON from 'babylonjs'
import MinionCardView from './MinionCardView.ts'

class HandView {
  public mesh: BABYLON.TransformNode

  private scene: BABYLON.Scene
  private cards: MinionCardView[] = []
  private readonly CARD_SPACING = 1
  private readonly HAND_Y_POSITION = -3
  private readonly HAND_Z_POSITION = -1

  constructor(scene: BABYLON.Scene) {
    this.scene = scene

    this.mesh = new BABYLON.TransformNode('hand', this.scene)
  }

  /**
   * Set the entire hand data at once, replacing any existing cards
   * @param cards Array of MinionCardView instances to set in the hand
   */
  public setHandData(cards: MinionCardView[]): void {
    this.cards.forEach((card) => card.dispose())

    this.cards = cards
    this.arrangeCards()
  }

  /**
   * Add a single card to the hand
   * @param card MinionCardView to add to the hand
   */
  public addCard(card: MinionCardView): void {
    card.transformToHand()
    this.cards.push(card)
    this.arrangeCards()
  }

  /**
   * Remove a specific card from the hand
   * @param card MinionCardView to remove
   */
  public removeCard(card: MinionCardView): void {
    const index = this.cards.indexOf(card)
    if (index !== -1) {
      this.cards.splice(index, 1)
      card.dispose()
      this.arrangeCards()
    }
  }

  /**
   * Arrange cards in a horizontal line with even spacing
   */
  private arrangeCards(): void {
    const totalWidth = (this.cards.length - 1) * this.CARD_SPACING
    const startX = -totalWidth / 2

    this.cards.forEach((card, index) => {
      card.mesh.parent = this.mesh

      const xPosition = startX + index * this.CARD_SPACING

      // Position the card
      card.mesh.position.set(xPosition, this.HAND_Y_POSITION, -index)
      card.originalPosition = card.mesh.position

      // Ensure the card is in hand view mode
      card.transformToHand()
    })
  }

  /**
   * Get the number of cards currently in the hand
   */
  public get cardCount(): number {
    return this.cards.length
  }

  /**
   * Dispose of all cards and clear the hand
   */
  public clear(): void {
    this.cards.forEach((card) => card.dispose())
    this.cards = []
  }
}

export default HandView
