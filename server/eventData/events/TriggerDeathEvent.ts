import { EventType, PlayerID } from '@constants'
import Event from '@event'
import Game from '@gameInstance'
import { notifyClient } from '@ws'

class TriggerDeathEvent extends Event {
  constructor() {
    super(EventType.TriggerDeath)
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const player1 = Game.getPlayerData(PlayerID.Player1),
      player2 = Game.getPlayerData(PlayerID.Player2)

    for (let i = player1.board.length - 1; i >= 0; i--) {
      if (player1.board[i].health < 1) {
        player1.graveyard.push(player1.board[i])
        player1.board.splice(i, 1)
      }
    }
    for (let i = player2.board.length - 1; i >= 0; i--) {
      if (player2.board[i].health < 1) {
        player2.graveyard.push(player2.board[i])
        player2.board.splice(i, 1)
      }
    }

    notifyClient(EventType.TriggerDeath, true, {})
    return true
  }
}

export default TriggerDeathEvent
