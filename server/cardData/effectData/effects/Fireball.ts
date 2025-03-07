import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID'
import { engine } from '@engine'
import Event from '@event'
import { EventType } from '@constants'

class Fireball extends Effect {
  constructor(uniqueID: number, player: number) {
    super(EffectID.FIREBALL, uniqueID, player)
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

export default Fireball
