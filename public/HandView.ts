import * as THREE from 'three'
import MinionCardView from './MinionCardView.ts'

export default class HandView {
  public mesh: THREE.Object3D

  private cards: MinionCardView[] = []
  private readonly CARD_SPACING = 1.5
  private readonly HAND_Y_POSITION = -3.5

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Object3D()
    this.mesh.name = 'hand'
    scene.add(this.mesh)
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
      this.mesh.add(card.mesh)
      card.transformToHand()

      const xPosition = startX + index * this.CARD_SPACING

      card.mesh.position.set(xPosition, this.HAND_Y_POSITION, index)
      card.originalPosition = card.mesh.position.clone()
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
