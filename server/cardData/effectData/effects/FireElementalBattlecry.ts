import GameState from '@gameState'
import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from '@event'
import { EventType } from '@constants'

class FireElementalBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EffectID.FIRE_ELEMENTAL_BATTLECRY, -1, player)
  }

  apply(source: Minion, target: Minion | null): void {
    if (!this.gameState || !source) {
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
      (this.gameState.opponentBoard.length > 0 && this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
    }
  }
}

export default FireElementalBattlecry
