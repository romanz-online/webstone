import { getGameState } from 'wsEvents.ts'
import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from '@event'
import { EventType, PlayerID } from '@constants'
import Character from '@character'
import GameState from '@gameState'

class Swipe extends Effect {
  constructor(uniqueID: number, playerOwner: PlayerID) {
    super(EffectID.FIREBALL, uniqueID, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (target) {
      engine.queueEvent([
        new Event(EventType.Damage, {
          source: source,
          target: target,
          amount: this.getAmount(),
        }),
      ])
    } else if (
      this.requiresTarget ||
      (gameState.opponentBoard.length > 0 && this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
    }
  }

  validateTarget(gameState: GameState, target: Character): boolean {
    if (!gameState) {
      console.error('Missing GameState')
    }

    return target.playerOwner !== this.playerOwner
  }
}

export default Swipe
