import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'
import StartTurnEvent from './StartTurnEvent.ts'

class EndTurnEvent extends Event {
  player1: PlayerData
  player2: PlayerData

  constructor(player1: PlayerData, player2: PlayerData) {
    super(EventType.EndTurn)
    this.player1 = player1
    this.player2 = player2
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.player1.hero.canAttack = false
    for (const minion of this.player1.board) {
      minion.canAttack = false
    }

    this.player2.hero.canAttack = false
    for (const minion of this.player2.board) {
      minion.canAttack = false
    }

    // SWITCH whoseTurn

    engine.queueEvent(new StartTurnEvent(this.player1, this.player2))

    notifyClient(EventType.EndTurn, true, {})
    return true
  }
}

export default EndTurnEvent
