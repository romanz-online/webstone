import { EventType, PlayerID } from '@constants'
import Event from '@event'
import GameInstance from '@gameInstance'
import Minion from '@minion'
import { notifyClient } from '@ws'

class SummonMinionEvent extends Event {
  playerID: PlayerID
  minion: Minion
  boardIndex: number

  constructor(playerID: PlayerID, minion: Minion, boardIndex: number) {
    super(EventType.SummonMinion)
    this.playerID = playerID
    this.minion = minion
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return false

    gameInstance
      .getPlayerData(this.playerID)
      .board.splice(this.boardIndex, 0, this.minion)

    this.minion.inPlay = true

    notifyClient(EventType.SummonMinion, true, {})

    return true
  }
}

export default SummonMinionEvent
