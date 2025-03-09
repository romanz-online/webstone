import { EventType } from '@constants'
import Event from '@event'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class StartTurnEvent extends Event {
  player1: PlayerData
  player2: PlayerData

  constructor(player1: PlayerData, player2: PlayerData) {
    super(EventType.StartTurn)
    this.player1 = player1
    this.player2 = player2
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    // ENABLE ATTACK FOR WHOEVER'S TURN IS STARTING

    this.player1.hero.canAttack = true
    for (const minion of this.player1.board) {
      minion.canAttack = true
    }

    // SWITCH whoseTurn

    this.player1.manaCapacity += this.player1.manaCapacity === 10 ? 0 : 1
    this.player1.mana = this.player1.manaCapacity - this.player1.overload

    notifyClient(EventType.StartTurn, true, {})
    return true
  }
}

export default StartTurnEvent
