import { EventType } from '@constants'
import { TryTargetData } from '../EventInterfaces.ts'
import TryEvent from '@tryEvent'

/**
 * TryTarget Event
 * 
 * Data required: { targetID: number }
 */
class TryTargetEvent extends TryEvent {
  targetID: number

  constructor(targetID: number) {
    super(EventType.TryTarget)
    this.targetID = targetID
  }

  // Convenience method to get data as interface
  getData(): TryTargetData {
    return {
      targetID: this.targetID
    }
  }
}

export default TryTargetEvent
