import { EventType } from '@constants'
import Event from '@event'
import Minion from '@minion'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class SummonMinionEvent extends Event {
  playerData: PlayerData
  minion: Minion
  boardIndex: number

  constructor(playerData: PlayerData, minion: Minion, boardIndex: number) {
    super(EventType.SummonMinion)
    this.playerData = playerData
    this.minion = minion
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.playerData.board.splice(this.boardIndex, 0, this.minion)
    this.minion.inPlay = true

    notifyClient(EventType.SummonMinion, true, {})

    return true
  }
}

export default SummonMinionEvent
