import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryEndTurnEvent extends TryEvent {
  constructor() {
    super(EventType.TryEndTurn)
  }
}

export default TryEndTurnEvent
