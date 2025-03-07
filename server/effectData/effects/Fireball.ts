import Minion from '../../characterData/minionData/minion'
import Effect from '../Effect'
import EFFECT_ID from '../effectID.json'
import { engine } from '../../Engine'
import Event from '../../Event'
import { EventType } from '../../constants'

class Fireball extends Effect {
  constructor(player: number) {
    super(EFFECT_ID.FIREBALL, player)
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
