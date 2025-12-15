import { EventType } from '@constants'
import TryEvent from '@tryEvent'

/**
 * TryEndTurn Event
 * 
 * Data required: None
 */
class TryEndTurnEvent extends TryEvent {
  constructor() {
    super(EventType.TryEndTurn)
  }
}

export default TryEndTurnEvent
