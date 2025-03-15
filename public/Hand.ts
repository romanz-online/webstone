import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import { Minion } from './Minion.ts'

export class Hand extends PIXI.Container {
  cardArray: Minion[] = []

  constructor() {
    super()

    for (let i = 0; i < 6; i++) {
      const card = new Minion()
      card.position.set(this.x, this.y)
      card.scale.set(0.5)
      card.pivot.set(card.width / 2, card.height / 2)
      this.cardArray.push(card)
      this.addChild(card)
    }

    this.adjustCardPositions()
  }

  private getCardY(x: number): number {
    return 2 * x * x + 20 * x + this.y
  }

  adjustCardPositions(): void {
    const isEven = this.cardArray.length % 2 === 0,
      midway = Math.floor(this.cardArray.length / 2)

    for (let i = 0; i < this.cardArray.length; i++) {
      const offsetIndex = i - midway + (isEven ? 0.75 : 0)

      gsap.to(this.cardArray[i], {
        x: this.x + 44 + (offsetIndex * this.cardArray[i].width) / 2,
        y: this.getCardY(offsetIndex * (i < midway ? -1 : 1)),
        rotation: (Math.PI / 4) * (offsetIndex / this.cardArray.length),
        duration: 1,
        ease: 'power4.out',
        delay: i * 0.05,
      })
    }
  }
}
