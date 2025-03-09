import { engine } from '@engine'
import Event from 'eventData/Event.ts'
import Minion from '@minion'
import Effect from '@effect'
import PlayCardEvent from '@events/PlayCardEvent.ts'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  push(event: Event): void {
    if (event instanceof PlayCardEvent) {
      if (!event.card) return

      if (event.card instanceof Minion) {
        // CHECK FOR BATTLECRY, CHOOSE ONE, COMBO
        const minion: Minion = event.card
        // WON'T WAIT FOR BATTLECRY IF THERE ARE NO ELIGIBLE TARGETS FOR THE BATTLECRY
        // NEED TO IMPLEMENT THAT (TARGET VALIDATOR IN EACH EFFECT); SAME WITH OTHER NON-SPELL EFFECTS
        this.waiting = !!minion.effects.battlecry
        // NEED TO CHECK canTarget, requiresTarget AND TARGET VALIDATOR. IF VALIDATOR IS FALSE, DON'T WAIT
        // AND JUST PLAY MINION/EXECUTE STACK
      } else if (event.card instanceof Effect) {
        const spell: Effect = event.card
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
      engine.queueEvent(this.stack[i])
    }
    this.clear()
  }

  getBottom(): any {
    return this.stack[0] || null
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
