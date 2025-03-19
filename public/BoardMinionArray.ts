import * as PIXI from 'pixi.js'
import MinionBoardView from './MinionBoardView.ts'

class BoardMinionArray extends PIXI.Container {
  minionViewArray: MinionBoardView[] = []
  placeholderIndex: number = -1

  constructor(width: number, height: number) {
    super()
    this.width = width
    this.height = height
  }

  generatePlaceholder(x: number): void {
    for (let i = 0; i < this.minionViewArray.length; i++) {
      this.placeholderIndex = i
      if (x < this.minionViewArray[i].x) {
        this.placeholderIndex -= 1
        break
      }
    }

    this.adjustMinionPositions()
  }

  resetPlaceholder(): void {
    this.placeholderIndex = -1
    this.adjustMinionPositions()
  }

  setData(minions: MinionBoardView[]): void {
    this.minionViewArray.forEach((minion) => {
      this.removeChild(minion)
    })

    this.minionViewArray = minions
    this.minionViewArray.forEach((minion) => {
      this.addChild(minion)
    })

    this.adjustMinionPositions()
  }

  adjustMinionPositions(): void {
    for (let i = 0; i < this.minionViewArray.length; i++) {
      this.minionViewArray[i].x =
        (i + 1 + (i >= this.placeholderIndex ? 1 : 0)) *
        (this.minionViewArray[i].width + 10)
      this.minionViewArray[i].y = this.y - this.minionViewArray[i].height * 2
    }
  }

  getWidth(): number {
    return (
      (this.minionViewArray.length + (this.placeholderIndex > -1 ? 1 : 0)) *
      (this.minionViewArray[0].width + 10)
    )
  }
}

export default BoardMinionArray
