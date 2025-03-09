import Effect from '@effect'
import { engine } from '@engine'
import EffectEvent from '@events/EffectEvent.ts'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import SummonMinionEvent from '@events/SummonMinionEvent.ts'
import Minion from '@minion'
import PlayerData from '@playerData'
import Event from 'eventData/Event.ts'

class EventStack {
  private stack: Event[] = []
  private waiting: boolean
  player1: PlayerData
  player2: PlayerData

  constructor(player1: PlayerData, player2: PlayerData) {
    this.stack = []
    this.waiting = false
    this.player1 = player1
    this.player2 = player2
  }

  // this method does NOT do any error handling
  // that's all handled in GameState
  generateStack(event: Event): void {
    this.waiting = false

    if (this.stack.length > 0) return

    if (event instanceof PlayCardEvent) {
      if (event.card instanceof Minion) {
        const minion: Minion = event.card
        this.stack.push(event)
        this.stack.push(
          new SummonMinionEvent(event.playerData, minion, event.boardIndex)
        )

        const battlecry: Effect = minion.getBattlecry() // HANDLE COMBO AND CHOOSE ONE LATER
        if (battlecry) {
          if (battlecry.requiresTarget) {
            this.waiting = true
            this.stack.push(new EffectEvent(battlecry, minion, null))
          } else if (
            battlecry.canTarget &&
            battlecry.availableTargets(this.player1, this.player2).length > 0
          ) {
            this.waiting = true
            this.stack.push(new EffectEvent(battlecry, minion, null))
          }
        }
      } else if (event.card instanceof Effect) {
        const spell: Effect = event.card
        this.stack.push(event)
        this.waiting = spell.canTarget && spell.requiresTarget
        this.stack.push(new EffectEvent(spell, event.playerData.hero, null))
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
