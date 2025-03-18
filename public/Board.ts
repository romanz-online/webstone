import * as PIXI from 'pixi.js'
import CardDragState from './CardDragState.ts'
import MinionBoardView from './MinionBoardView.ts'

class Board extends PIXI.Container {
  minionViewArray: MinionBoardView[] = []
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

    this.eventMode = 'static'
    this.on('mouseover', (event) => {
      if (!CardDragState.getDraggedCard()) return
    })
  }

  setBoardData(minions: MinionBoardView[]): void {
    this.minionViewArray.forEach((minion) => {
      if (minion instanceof MinionBoardView) {
        this.removeChild(minion)
      }
    })

    this.minionViewArray = minions
    this.minionViewArray.forEach((minion) => {
      this.addChild(minion)
    })
    this.adjustMinionPositions()
  }

  adjustMinionPositions() {
    for (let i = 0; i < this.minionViewArray.length; i++) {
      this.minionViewArray[i].x = (i + 1) * this.minionViewArray[i].width * 1.2
      this.minionViewArray[i].y = this.y - this.minionViewArray[i].height * 2
    }
  }
}

export default Board
