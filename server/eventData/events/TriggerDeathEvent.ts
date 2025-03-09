import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import Minion from '@minion'
import PlayerData from '@playerData'

class TriggerDeathEvent extends Event {
  player1: PlayerData
  player2: PlayerData
  graveyard: Minion[]

  constructor(player1: PlayerData, player2: PlayerData, graveyard: Minion[]) {
    super(EventType.TriggerDeath)
    this.player1 = player1
    this.player2 = player2
    this.graveyard = graveyard
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    for (let i = this.player1.board.length - 1; i >= 0; i--) {
      if (this.player1.board[i].health < 1) {
        this.graveyard.push(this.player1.board[i])
        this.player1.board.splice(i, 1)
      }
    }
    for (let i = this.player2.board.length - 1; i >= 0; i--) {
      if (this.player2.board[i].health < 1) {
        this.graveyard.push(this.player2.board[i])
        this.player2.board.splice(i, 1)
      }
    }

    notifyClient(EventType.TriggerDeath, true, {})
    return true
  }
}

export default TriggerDeathEvent
