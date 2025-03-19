import * as PIXI from 'pixi.js'
import MinionBoardView from './MinionBoardView.ts'

class Board extends PIXI.Container {
  minionViewArray: MinionBoardView[] = []
  bounds: PIXI.Graphics
  placeholderIndex: number

  constructor(width: number, height: number) {
    super()

    this.width = width
    this.height = height
    this.placeholderIndex = -1

    this.bounds = new PIXI.Graphics()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0 })
      .stroke({ width: 2, color: 0xff0000 })
    this.addChild(this.bounds)
  }

  handleCardDragOver(x: number, y: number): void {
    for (let i = 0; i < this.minionViewArray.length; i++) {
      this.placeholderIndex = i
      if (x < this.minionViewArray[i].x) {
        this.placeholderIndex -= 1
        console.log(x, 'vs', this.minionViewArray[i].x)
        console.log(i, 'becomes', this.placeholderIndex)
        break
      }
    }

    this.adjustMinionPositions()
  }

  resetPlaceholder(): void {
    this.placeholderIndex = -1
    this.adjustMinionPositions()
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

  // INSTEAD OF DOING THIS HERE, MAKE A NEW CONTAINER ELEMENT WITH ALL OF THE MINIONS
  // AND THEN CENTER IT AND DO THE POSITION MANIPULATION IN IT BECAUSE IT WILL WORK
  // FROM THE CENTER INSTEAD OF THE LEFT EDGE WHICH IS STUPID
  adjustMinionPositions() {
    for (let i = 0; i < this.minionViewArray.length; i++) {
      this.minionViewArray[i].x =
        (i + 1 + (i >= this.placeholderIndex ? 1 : 0)) *
        (this.minionViewArray[i].width + 10)

      this.minionViewArray[i].y = this.y - this.minionViewArray[i].height * 2
    }
  }
}

export default Board
