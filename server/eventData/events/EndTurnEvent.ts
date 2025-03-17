import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import Game from '@gameInstance'
import { notifyClient } from '@ws'
import StartTurnEvent from './StartTurnEvent.ts'

class EndTurnEvent extends Event {
  constructor() {
    super(EventType.EndTurn)
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const playerData = Game.getPlayerData(Game.whoseTurn)

    playerData.hero.canAttack = false
    for (const minion of playerData.board) {
      minion.canAttack = false
    }

    Game.flipWhoseTurn()

    engine.queueEvent(new StartTurnEvent())

    notifyClient(EventType.EndTurn, true, {})
    return true
  }
}

export default EndTurnEvent
