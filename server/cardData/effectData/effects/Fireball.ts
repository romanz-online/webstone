import { getGameState } from 'wsEvents.ts'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from 'eventData/Event.ts'
import { EventType, PlayerID } from '@constants'
import Character from '@character'
import DamageEvent from '@events/DamageEvent.ts'

class Fireball extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.FIREBALL, id, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (target) {
      engine.queueEvent(new DamageEvent(source, [target], this.getAmount()))
    } else if (
      this.requiresTarget ||
      (gameState.opponentBoard.length > 0 && this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
    }
  }
}

export default Fireball
