import { getGameState } from 'wsEvents.ts'
import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from 'eventData/Event.ts'
import { EventType, PlayerID } from '@constants'
import Character from '@character'
import GameState from '@gameState'
import ChangeStatsEvent from '@events/ChangeStatsEvent.ts'

class MarkOfTheWild extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.MARK_OF_THE_WILD, id, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (target) {
      engine.queueEvent(
        // ALSO NEED SOME WAY TO GIVE IT TAUNT
        new ChangeStatsEvent(source, [target], 0, 2, 2)
      )
    }
  }

  validateTarget(target: Character | null): boolean {
    const gameState: GameState = getGameState()
    if (!gameState) {
      console.error('Missing GameState')
    }

    if (!target) {
      if (
        this.requiresTarget ||
        (gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
        return false
      }
    }

    return target instanceof Minion
  }
}

export default MarkOfTheWild
