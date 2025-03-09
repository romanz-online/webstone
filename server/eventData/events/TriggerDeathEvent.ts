import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import Minion from '@minion'

class TriggerDeathEvent extends Event {
  player1Board: Minion[]
  player2Board: Minion[]
  graveyard: Minion[]

  constructor(
    player1Board: Minion[],
    player2Board: Minion[],
    graveyard: Minion[]
  ) {
    super(EventType.TriggerDeath)
    this.player1Board = player1Board
    this.player2Board = player2Board
    this.graveyard = graveyard
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    for (let i = this.player1Board.length - 1; i >= 0; i--) {
      if (this.player1Board[i].health < 1) {
        this.graveyard.push(this.player1Board[i])
        this.player1Board.splice(i, 1)
      }
    }
    for (let i = this.player2Board.length - 1; i >= 0; i--) {
      if (this.player2Board[i].health < 1) {
        this.graveyard.push(this.player2Board[i])
        this.player2Board.splice(i, 1)
      }
    }

    notifyClient(EventType.TriggerDeath, true, {})
    return true
  }
}

export default TriggerDeathEvent
