import { getGameState } from 'wsEvents.ts'
import Character from '@character'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from 'eventData/Event.ts'
import { EventType } from '@constants'

class FireElementalBattlecry extends Effect {
  constructor(playerOwner: number) {
    super(EffectID.FIRE_ELEMENTAL_BATTLECRY, -1, playerOwner)
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
}

export default FireElementalBattlecry
