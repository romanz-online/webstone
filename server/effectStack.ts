import { GameState } from './gameState'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import { notifyClient } from './ws'

class EffectStack {
  private stack: Effect[]
  private waiting: boolean

  constructor() {
    this.stack = []
    this.waiting = false
  }

  // Push a new effect onto the stack
  push(effect: Effect): number {
    this.stack.push(effect)
    this.waiting = true
    return this.stack.length
  }

  // Process the top effect with the given target
  processTopEffect(gameState: GameState, targetID: number): boolean {
    if (this.stack.length === 0) {
      console.error('No effects in stack to process')
      return false
    }

    const currentEffect: Effect = this.stack[this.stack.length - 1]
    const target: Minion | null = gameState.getBoardMinion(targetID)

    if (!target) {
      console.error('Could not find target with ID', targetID, 'on board')
      notifyClient('target', false, gameState.toJSON())
      return false
    }

    // Process the effect
    currentEffect.source.doBattlecry(gameState, target)

    // Remove the processed effect
    this.stack.pop()

    // Check if we have more effects waiting
    this.waiting = this.stack.length > 0

    // If we have more effects waiting, notify client to get another target
    if (this.waiting) {
      const nextEffect: Effect = this.stack[this.stack.length - 1]
      notifyClient('getTarget', true, { minion: nextEffect.source })
    }

    return true
  }

  // Check if there are any effects waiting for targets
  isWaiting(): boolean {
    return this.waiting
  }

  // Get the current effect that's waiting for a target
  getCurrentEffect(): Effect | null {
    if (!this.waiting || this.stack.length === 0) {
      return null
    }
    return this.stack[this.stack.length - 1]
  }

  clear(): void {
    this.stack = []
    this.waiting = false
  }
}

export default EffectStack
