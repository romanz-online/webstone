import * as PIXI from 'pixi.js'
import CardDragState from './CardDragState.ts'
import MinionCardView from './MinionCardView.ts'

class Board extends PIXI.Container {
  minionArray: MinionCardView[] = []
  bounds: PIXI.Graphics

  constructor(width: number, height: number) {
    super()

    this.width = width
    this.height = height

    this.bounds = new PIXI.Graphics()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0 })
      .stroke({ width: 2, color: 0xff0000 })
    this.addChild(this.bounds)

    // for (let i = 0; i < 1; i++) {
    //   const card = new Minion()
    //   card.serverData.location = CardLocation.Board
    //   card.position.set(this.x, this.y)
    //   card.scale.set(0.5)
    //   card.pivot.set(card.width / 2, card.height / 2)
    //   this.minionArray.push(card)
    //   this.addChild(card)
    // }

    this.eventMode = 'static'
    this.on('mouseover', (event) => {
      if (!CardDragState.getDraggedCard()) return
    })
  }
}

export default Board
