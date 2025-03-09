import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryHeroPowerEvent extends TryEvent {
  constructor() {
    super(EventType.TryHeroPower)
  }
}

export default TryHeroPowerEvent
