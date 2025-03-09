import { EventType } from '@constants'
import Event from '@event'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class TriggerDeathEvent extends Event {
  player1: PlayerData
  player2: PlayerData

  constructor(player1: PlayerData, player2: PlayerData) {
    super(EventType.TriggerDeath)
    this.player1 = player1
    this.player2 = player2
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    for (let i = this.player1.board.length - 1; i >= 0; i--) {
      if (this.player1.board[i].health < 1) {
        this.player1.graveyard.push(this.player1.board[i])
        this.player1.board.splice(i, 1)
      }
    }
    for (let i = this.player2.board.length - 1; i >= 0; i--) {
      if (this.player2.board[i].health < 1) {
        this.player2.graveyard.push(this.player2.board[i])
        this.player2.board.splice(i, 1)
      }
    }

    notifyClient(EventType.TriggerDeath, true, {})
    return true
  }
}

export default TriggerDeathEvent
