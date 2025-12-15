import { EventType } from '@constants'
import { TryPlayCardData } from '../EventInterfaces.ts'
import TryEvent from '@tryEvent'

/**
 * TryPlayCard Event
 * 
 * Data required depends on card type:
 * - Minions: { boardIndex: number, minionID: number, playerID: PlayerID }
 * - Spells: { cardID: number, playerID: PlayerID }  
 * - Weapons: { cardID: number, playerID: PlayerID }
 */
class TryPlayCardEvent extends TryEvent {
  data: TryPlayCardData

  constructor(data: TryPlayCardData) {
    super(EventType.TryPlayCard)
    this.data = data
  }
}

export default TryPlayCardEvent
