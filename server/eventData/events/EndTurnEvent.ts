import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import GameInstance from '@gameInstance'
import { notifyClient } from '@ws'
import StartTurnEvent from './StartTurnEvent.ts'

class EndTurnEvent extends Event {
  constructor() {
    super(EventType.EndTurn)
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return false

    const playerData = gameInstance.getPlayerData(gameInstance.whoseTurn)

    playerData.hero.canAttack = false
    for (const minion of playerData.board) {
      minion.canAttack = false
    }

    gameInstance.flipWhoseTurn()

    engine.queueEvent(new StartTurnEvent())

    notifyClient(EventType.EndTurn, true, {})
    return true
  }
}

export default EndTurnEvent
