import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryPlayCardEvent extends TryEvent {
  data: any

  constructor(data: any) {
    super(EventType.TryPlayCard)
    this.data = data
  }
}

export default TryPlayCardEvent
