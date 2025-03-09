import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import Card from '@card'
import { engine } from '@engine'
import FatigueEvent from './FatigueEvent.ts'
import PlayerData from '@playerData'

class DrawCardEvent extends Event {
  playerData: PlayerData

  constructor(playerData: PlayerData) {
    super(EventType.DrawCard)
    this.playerData = playerData
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const card: Card = this.playerData.deck.pop()
    if (card) {
      console.log('player draws a card')
      this.playerData.hand.push(card)
      notifyClient(EventType.DrawCard, true, {})
    } else {
      // engine.queueEvent(new FatigueEvent(this.player))
    }

    return true
  }
}

export default DrawCardEvent
