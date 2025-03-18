import { CardLocation, EventType, PlayerID } from '@constants'
import Event from '@event'
import Game from '@gameInstance'
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

    Game.getPlayerData(this.playerID).board.splice(
      this.boardIndex,
      0,
      this.minion
    )

    this.minion.location = CardLocation.Board

    notifyClient(EventType.SummonMinion, true, {
      playerID: this.playerID,
      minionID: this.minion.id,
      boardIndex: this.boardIndex,
    })

    return true
  }
}

export default SummonMinionEvent
