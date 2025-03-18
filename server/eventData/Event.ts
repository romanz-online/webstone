import { EventType } from '@constants'

class Event {
  event: EventType

  constructor(event: EventType) {
    this.event = event
  }

  toString() {
    return `${this.constructor.name}`
  }

  execute(): boolean {
    throw new Error('execute() method must be implemented by subclasses')
  }
}

export default Event
