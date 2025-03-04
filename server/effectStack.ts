import { GameState } from './gameState'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import { notifyClient } from './ws'
import { engine } from './engine'

interface QueuedEvent {
  event: string
  data: any
}

class EffectStack {
  private stack: QueuedEvent[] = [] // CONVERT THIS TO SOMETHING WHICH ALSO HOLDS A 'PLAY MINION' EVENT
  // LIKE AN "EVENT STACK"?
  private waiting: boolean
  private gameState: GameState

  constructor(gameState: GameState) {
    this.stack = []
    this.waiting = false
    this.gameState = gameState
  }

  push(event: string, data: any): boolean {
    this.stack.push({ event: event, data: data })
    if (event === 'playMinion') {
      // CHECK FOR BATTLECRY, CHOOSE ONE, COMBO
      const minion: Minion = data.minion
      if (minion) {
        this.waiting = !!minion.effects.battlecry
      }
    }
    return this.waiting
  }

  executeStack(): void {
    while (this.stack.length > 0) {
      this.processTopEffect()
    }
  }

  getTop(): any {
    return this.stack[this.stack.length - 1]
  }

  // Process the top effect with the given target
  processTopEffect(): void {
    if (this.stack.length === 0) {
      console.error('No effects in stack to process')
      return
    }

    const current: any = this.stack[this.stack.length - 1].data
    if (current instanceof Effect) {
      current.apply()

      engine.queueEvent([
        {
          event: 'effect',
          data: {
            effect: current,
          },
        },
      ])

      this.stack.pop()
    } else {
      current.hand.splice(current.hand.indexOf(current.minion), 1)[0]
      current.board.splice(current.boardIndex, 0, current.minion)
      current.minion.inPlay = true

      notifyClient('playMinion', true, {
        minion: current.minion,
      })

      this.stack.pop()
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
