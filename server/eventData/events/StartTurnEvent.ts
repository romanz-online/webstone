import { EventType } from '@constants'
import Event from '@event'
import GameInstance from '@gameInstance'
import { notifyClient } from '@ws'

class StartTurnEvent extends Event {
  constructor() {
    super(EventType.StartTurn)
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return false

    const playerData = gameInstance.getPlayerData(gameInstance.whoseTurn)

    playerData.hero.canAttack = true
    for (const minion of playerData.board) {
      minion.canAttack = true
    }

    playerData.manaCapacity += playerData.manaCapacity === 10 ? 0 : 1
    playerData.mana = playerData.manaCapacity - playerData.overload

    notifyClient(EventType.StartTurn, true, {})
    return true
  }
}

export default StartTurnEvent
