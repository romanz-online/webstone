import Card from '@card'
import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import PlayerData from '@playerData'
import FatigueEvent from './FatigueEvent.ts'

class DrawCardEvent extends Event {
  player: PlayerData

  constructor(player: PlayerData) {
    super(EventType.DrawCard)
    this.player = player
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const card: Card = this.player.deck.pop()
    if (card) {
      console.log('player draws a card')
      if (this.player.hand.length === 10) {
        // overdraw
      } else {
        this.player.hand.push(card)
      }
      // notifyClient(EventType.DrawCard, true, {})
    } else {
      engine.queueEvent(new FatigueEvent(this.player))
    }

    return true
  }
}

export default DrawCardEvent
