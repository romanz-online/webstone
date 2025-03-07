import { engine } from '@engine'
import { EventType } from '@constants'
import Event from '@event'
import Minion from '@minion'
import Effect from '@effect'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  push(event: Event): void {
    if (event.type === EventType.PlayCard) {
      if (!event.data.card) return

      if (event.data.card instanceof Minion) {
        // CHECK FOR BATTLECRY, CHOOSE ONE, COMBO
        const minion: Minion = event.data.card
        // WON'T WAIT FOR BATTLECRY IF THERE ARE NO ELIGIBLE TARGETS FOR THE BATTLECRY
        // NEED TO IMPLEMENT THAT (TARGET VALIDATOR IN EACH EFFECT); SAME WITH OTHER NON-SPELL EFFECTS
        this.waiting = !!minion.effects.battlecry
        // NEED TO CHECK canTarget, requiresTarget AND TARGET VALIDATOR. IF VALIDATOR IS FALSE, DON'T WAIT
        // AND JUST PLAY MINION/EXECUTE STACK
      } else if (event.data.card instanceof Effect) {
        const spell: Effect = event.data.card
        if (spell.canTarget && spell.requiresTarget) {
          this.waiting = true
        }
      }
    } else {
      // ??? IDK
      // THIS HAPPENS ON Target EVENTS, ONLY WORKS FOR SINGLE-TARGET EFFECTS
      this.waiting = false
    }

    this.stack.push(event)
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
