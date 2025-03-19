import * as PIXI from 'pixi.js'
import BoardMinionArray from './BoardMinionArray.ts'
import MinionBoardView from './MinionBoardView.ts'

class Board extends PIXI.Container {
  minionArray: BoardMinionArray
  bounds: PIXI.Graphics

  constructor(width: number, height: number) {
    super()

    this.width = width
    this.height = height
    this.minionArray = new BoardMinionArray(width, height)
    this.addChild(this.minionArray)

    this.bounds = new PIXI.Graphics()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0 })
      .stroke({ width: 2, color: 0xff0000 })
    this.addChild(this.bounds)
  }

  handleCardDragOver(x: number): void {
    this.minionArray.generatePlaceholder(x)
  }

  getMinionDropIndex(): number {
    return this.minionArray.placeholderIndex
  }

  summonMinion(id: number) {
    this.minionArray.resetPlaceholder()
  }

  setBoardData(minions: MinionBoardView[]): void {
    this.minionArray.setData(minions)
    this.minionArray.x = (this.minionArray.getWidth() - this.width) / 2
    this.minionArray.y = this.y
  }
}

export default Board
