import Minion from './minionData/minion'
import { engine } from './Engine'
import Event from './event'
import { EventType } from './constants'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  push(event: Event): boolean {
    this.stack.push(event)
    if (event.type === EventType.PlayMinion) {
      // CHECK FOR BATTLECRY, CHOOSE ONE, COMBO
      const minion: Minion = event.data.minion
      if (minion) {
        // WON'T WAIT FOR BATTLECRY IF THERE ARE NO ELIGIBLE TARGETS FOR THE BATTLECRY
        // NEED TO IMPLEMENT THAT (TARGET VALIDATOR IN EACH EFFECT); SAME WITH OTHER NON-SPELL EFFECTS
        this.waiting = !!minion.effects.battlecry
      }
    } else {
      // CHECK FOR SPELL STUFF
    }
    return this.waiting
  }

  executeStack(): void {
    engine.queueEvent([...this.stack].reverse())
    this.clear()
  }

  getTop(): any {
    return this.stack[this.stack.length - 1]
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
