import Minion from './characterData/minionData/Minion'
import { engine } from './Engine'
import Event from './Event'
import { EventType } from './constants'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  push(event: Event): void {
    this.stack.push(event)
    if (event.type === EventType.PlayCard) {
      // CHECK FOR BATTLECRY, CHOOSE ONE, COMBO
      const minion: Minion = event.data.minion
      if (minion) {
        // WON'T WAIT FOR BATTLECRY IF THERE ARE NO ELIGIBLE TARGETS FOR THE BATTLECRY
        // NEED TO IMPLEMENT THAT (TARGET VALIDATOR IN EACH EFFECT); SAME WITH OTHER NON-SPELL EFFECTS
        this.waiting = !!minion.effects.battlecry
      }
    } else {
      // CHECK FOR SPELL STUFF
      this.waiting = false
    }
  }

  executeStack(): void {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      engine.queueEvent([this.stack[i]])
    }
    this.clear()
  }

  getTop(): any {
    return this.stack[this.stack.length - 1]
  }

  length(): number {
    return this.stack.length
  }

  isWaiting(): boolean {
    return this.waiting
  }

  clear(): void {
    this.stack = []
    this.waiting = false
  }
}

export default EventStack
