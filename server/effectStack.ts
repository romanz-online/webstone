import { GameState } from './gameState'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import { notifyClient } from './ws'

class EffectStack {
  private stack: Effect[]
  private waiting: boolean
  private gameState: GameState

  constructor(gameState: GameState) {
    this.stack = []
    this.waiting = false
    this.gameState = gameState
  }

  push(effect: Effect): void {
    this.stack.push(effect)
    this.waiting = true
  }

  runStack(): void {
    while (this.stack.length > 0) {
      this.processTopEffect()
    }
  }

  // Process the top effect with the given target
  processTopEffect(): void {
    if (this.stack.length === 0) {
      console.error('No effects in stack to process')
      return
    }

    const currentEffect: Effect = this.stack[this.stack.length - 1]
    const target: Minion | null = currentEffect.target

    // if (!target) {
    //   console.error('Could not find target with ID', targetID, 'on board')
    //   notifyClient('target', false, this.gameState.toJSON())
    //   return false
    // }

    // Process the effect
    currentEffect.source.doBattlecry(this.gameState, target)

    // Remove the processed effect
    this.stack.pop()

    // If we have more effects waiting, notify client to get another target
    if (this.waiting) {
      const nextEffect: Effect = this.stack[this.stack.length - 1]
      notifyClient('getTarget', true, { minion: nextEffect.source })
    }
  }

  isWaiting(): boolean {
    return this.waiting
  }

  clear(): void {
    this.stack = []
    this.waiting = false
  }
}

export default EffectStack
