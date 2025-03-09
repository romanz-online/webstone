import { EventType } from '@constants'
import Event from '@event'
import Minion from '@minion'
import { notifyClient } from '@ws'

class SummonMinionEvent extends Event {
  board: any
  minion: Minion
  boardIndex: number

  constructor(board: any, minion: Minion, boardIndex: number) {
    super(EventType.SummonMinion)
    this.board = board
    this.minion = minion
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.board.splice(this.boardIndex, 0, this.minion)
    this.minion.inPlay = true

    notifyClient(EventType.SummonMinion, true, {})

    return true
  }
}

export default SummonMinionEvent
