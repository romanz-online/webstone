import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryLoadEvent extends TryEvent {
  constructor() {
    super(EventType.TryLoad)
  }
}

export default TryLoadEvent
