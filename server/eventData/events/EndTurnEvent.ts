import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import PlayerData from '@playerData'

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

    this.player1.hero.canAttack = !this.player1.hero.canAttack
    for (const minion of this.player1.board) {
      minion.canAttack = !minion.canAttack
    }

    this.player2.hero.canAttack = !this.player2.hero.canAttack
    for (const minion of this.player2.board) {
      minion.canAttack = !minion.canAttack
    }

    notifyClient(EventType.EndTurn, true, {})
    return true
  }
}

export default EndTurnEvent
