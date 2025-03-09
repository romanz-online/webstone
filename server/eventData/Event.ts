import { EventType } from '@constants'

class Event {
  type: EventType

  constructor(type: EventType) {
    this.type = type
  }

  toString() {
    return `${this.constructor.name}`
  }

  execute(): boolean {
    throw new Error('execute() method must be implemented by subclasses')
  }
}

export default Event
