import Effect from '@effect'
import { engine } from '@engine'
import EffectEvent from '@events/EffectEvent.ts'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import SummonMinionEvent from '@events/SummonMinionEvent.ts'
import GameInstance from '@gameInstance'
import Minion from '@minion'
import Event from 'eventData/Event.ts'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  // this method does NOT do any error handling
  // that's all handled in GameInstance
  generateStack(event: Event): void {
    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return

    this.waiting = false

    if (this.stack.length > 0) return

    if (event instanceof PlayCardEvent) {
      if (event.card instanceof Minion) {
        const minion: Minion = event.card
        this.stack.push(event)
        this.stack.push(
          new SummonMinionEvent(event.playerID, minion, event.boardIndex)
        )

        // HANDLE COMBO AND CHOOSE ONE LATER
        const battlecry: Effect = minion.getBattlecry(),
          combo: Effect = minion.getCombo(),
          chooseOne: Effect = minion.getChooseOne()
        if (!battlecry && !combo && !chooseOne) return

        // ONLY NEED TO CHECK COMBO EFFECTS WHICH NEED A TARGET
        // OTHERS WILL APPLY PASSIVELY IN THE COMBO CARD ITSELF (E.G. Cold Blood)

        if (
          battlecry.requiresTarget ||
          battlecry.canTarget /*&& battlecry.availableTargets().length > 0*/
        ) {
          this.waiting = true
          this.stack.push(new EffectEvent(battlecry, minion, null))
        }
      } else if (event.card instanceof Effect) {
        const spell: Effect = event.card
        this.stack.push(event)
        this.waiting = spell.canTarget && spell.requiresTarget
        this.stack.push(
          new EffectEvent(
            spell,
            gameInstance.getPlayerData(event.playerID).hero,
            null
          )
        )
      }
    }
  }

  executeStack(): void {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      engine.queueEvent(this.stack[i])
    }
    this.clear()
  }

  getStackedEffect(): any {
    return this.stack[this.stack.length - 1] || null
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
