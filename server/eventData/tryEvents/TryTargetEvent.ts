import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryTargetEvent extends TryEvent {
  targetID: number

  constructor(targetID: number) {
    super(EventType.TryTarget)
    this.targetID = targetID
  }
}

export default TryTargetEvent
