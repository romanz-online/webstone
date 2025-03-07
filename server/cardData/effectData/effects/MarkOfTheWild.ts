import { getGameState } from 'wsEvents.ts'
import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from '@event'
import { EventType, PlayerID } from '@constants'
import Character from '@character'
import GameState from '@gameState'

class MarkOfTheWild extends Effect {
  constructor(uniqueID: number, playerOwner: PlayerID) {
    super(EffectID.MARK_OF_THE_WILD, uniqueID, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (target) {
      engine.queueEvent([
        // ALSO NEED SOME WAY TO GIVE IT TAUNT
        new Event(EventType.ChangeStats, {
          source: source,
          target: [target],
          attack: 2,
          health: 2,
        }),
      ])
    } else if (
      this.requiresTarget ||
      (gameState.opponentBoard.length > 0 && this.canTarget)
    ) {
      // MOVE THIS IF STATEMENT INTO validateTarget?
      console.error('Target required for targeted damage effect')
    }
  }

  validateTarget(gameState: GameState, target: Character): boolean {
    if (!gameState) {
      console.error('Missing GameState')
    }

    return target instanceof Minion
  }
}

export default MarkOfTheWild
