import { EventType } from '@constants'
import Event from '@event'

class TryEvent extends Event {
  constructor(type: EventType) {
    super(type)
  }

  toString() {
    return `${this.constructor.name}`
  }

  execute(): boolean {
    return true
  }
}

export default TryEvent
