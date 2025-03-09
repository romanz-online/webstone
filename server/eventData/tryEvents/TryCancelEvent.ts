import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryCancelEvent extends TryEvent {
  constructor() {
    super(EventType.TryCancel)
  }
}

export default TryCancelEvent
