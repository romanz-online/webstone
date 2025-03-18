import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import MinionCardView from './MinionCardView.ts'

interface CardPosition {
  x: number
  y: number
  rotation: number
}

class Hand extends PIXI.Container {
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

  setHandData(cards: MinionCardView[]): void {
    this.cardViewArray.forEach((card) => {
      if (card instanceof MinionCardView) {
        this.removeChild(card)
      }
    })

    this.cardViewArray = cards
    this.cardViewArray.forEach((card) => {
      this.addChild(card)
    })
    this.adjustCardPositions()
  }

  playCard(id: number): void {
    const cardView: MinionCardView = this.cardViewArray.find(
      (card) => card.minion.id === id
    )

    // gsap.to(cardView, {
    //   duration: 0.1,
    //   alpha: 0,
    //   ease: 'power2.out',
    //   onComplete: () => {
    this.removeChild(cardView)
    //   },
    // })
  }

  adjustCardPositions(): void {
    for (let i = 0; i < this.cardViewArray.length; i++) {
      const newX = (i + 1) * this.cardViewArray[i].width * 0.5,
        newY = this.height / 2 - 20

      this.cardViewArray[i].zIndex = i
      this.cardViewArray[i].revertZ = i
      this.cardViewArray[i].revertX = newX
      this.cardViewArray[i].revertY = newY

      gsap.to(this.cardViewArray[i].position, {
        // x: this.width / 2 + this.cardPositions[this.cardArray.length][i].x - 20,
        // y:
        //   this.height / 2 + this.cardPositions[this.cardArray.length][i].y - 20,
        // rotation: this.cardPositions[this.cardArray.length][i].rotation,
        x: newX,
        y: newY,
        duration: 1,
        ease: 'power4.out',
        delay: i * 0.05,
      })
      gsap.to(this.cardViewArray[i], {
        rotation: 0,
        duration: 1,
        ease: 'power4.out',
        delay: i * 0.05,
      })
    }
  }
}

export default Hand
