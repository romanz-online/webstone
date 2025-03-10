import Card from '@card'
import { EventType, PlayerID } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import GameInstance from '@gameInstance'
import FatigueEvent from './FatigueEvent.ts'

class DrawCardEvent extends Event {
  playerID: PlayerID

  constructor(playerID: PlayerID) {
    super(EventType.DrawCard)
    this.playerID = playerID
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return false

    const playerData = gameInstance.getPlayerData(this.playerID)

    const card: Card = playerData.deck.pop()
    if (card) {
      console.log('player draws a card')
      if (playerData.hand.length === 10) {
        // overdraw
      } else {
        playerData.hand.push(card)
      }
      // notifyClient(EventType.DrawCard, true, {})
    } else {
      engine.queueEvent(new FatigueEvent(this.playerID))
    }

    return true
  }
}

export default DrawCardEvent
