import { EventType } from '@constants'
import TryEvent from '@tryEvent'

/**
 * TryHeroPower Event
 * 
 * Data required: None (NOT IMPLEMENTED YET)
 */
class TryHeroPowerEvent extends TryEvent {
  constructor() {
    super(EventType.TryHeroPower)
  }
}

export default TryHeroPowerEvent
