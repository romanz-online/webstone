import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import MinionCardView from './MinionCardView.ts'

interface CardPosition {
  x: number
  y: number
  rotation: number
}

export class Hand extends PIXI.Container {
  cardViewArray: MinionCardView[] = []
  bounds: PIXI.Graphics

  // private cardPositions: CardPosition[][] = [
  //   [],
  //   [{ x: 0, y: 0, rotation: 0 }],
  //   [
  //     { x: -90, y: 0, rotation: 0 },
  //     { x: 90, y: 0, rotation: 0 },
  //   ],
  //   [
  //     { x: -165, y: 0, rotation: 0 },
  //     { x: 0, y: 0, rotation: 0 },
  //     { x: 165, y: 0, rotation: 0 },
  //   ],
  //   [
  //     { x: -200, y: 45, rotation: -0.5 },
  //     { x: -60, y: 0, rotation: -0.2 },
  //     { x: 60, y: 0, rotation: 0.2 },
  //     { x: 200, y: 45, rotation: 0.5 },
  //   ],
  //   [
  //     { x: -200, y: 10, rotation: -0.5 },
  //     { x: -100, y: 0, rotation: -0.1 },
  //     { x: 0, y: 0, rotation: 0 },
  //     { x: 100, y: 20, rotation: 0.2 },
  //     { x: 200, y: 55, rotation: 0.4 },
  //   ],
  // ]

  // https://www.youtube.com/watch?v=hUi0eFuTi-g

  constructor(width: number, height: number) {
    super()

    this.width = width
    this.height = height

    this.bounds = new PIXI.Graphics()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0 })
      .stroke({ width: 2, color: 0xff0000 })
    this.addChild(this.bounds)

    this.adjustCardPositions()
  }

  addCard(card: MinionCardView): void {
    card.position.set(this.width, 0)
    this.cardViewArray.push(card)
    this.addChild(card)
    this.adjustCardPositions()
  }

  adjustCardPositions(): void {
    for (let i = 0; i < this.cardViewArray.length; i++) {
      this.cardViewArray[i].zIndex = i
      gsap.to(this.cardViewArray[i], {
        // x: this.width / 2 + this.cardPositions[this.cardArray.length][i].x - 20,
        // y:
        //   this.height / 2 + this.cardPositions[this.cardArray.length][i].y - 20,
        // rotation: this.cardPositions[this.cardArray.length][i].rotation,
        x: this.x + (i + 1) * this.cardViewArray[i].width * 0.7,
        y: this.height / 2 - 20,
        rotation: 0,
        duration: 1,
        ease: 'power4.out',
        delay: i * 0.05,
      })
    }
  }
}
