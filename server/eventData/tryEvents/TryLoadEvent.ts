import { EventType } from '@constants'
import TryEvent from '@tryEvent'

/**
 * TryLoad Event
 * 
 * Data required: None
 */
class TryLoadEvent extends TryEvent {
  constructor() {
    super(EventType.TryLoad)
  }
}

export default TryLoadEvent
