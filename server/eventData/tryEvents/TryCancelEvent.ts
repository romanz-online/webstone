import { EventType } from '@constants'
import TryEvent from '@tryEvent'

/**
 * TryCancel Event
 * 
 * Data required: None
 */
class TryCancelEvent extends TryEvent {
  constructor() {
    super(EventType.TryCancel)
  }
}

export default TryCancelEvent
