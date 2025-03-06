import GameState from '../../GameState'
import Minion from '../../minionData/minion'
import Effect from '../effect'
import EFFECT_ID from '../effectID.json'
import { engine } from '../../Engine'
import Event from '../../event'
import { EventType } from '../../constants'

class FireElementalBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EFFECT_ID.FIRE_ELEMENTAL_BATTLECRY, player, source, null)
  }

  apply(source: Minion, target: Minion | null): void {
    if (!this.gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (!target) {
      if (
        this.requiresTarget ||
        (this.gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
      }
    }

    if (target) {
      engine.queueEvent([
        new Event(EventType.Damage, {
          source: source,
          target: target,
          amount: this.getAmount(),
        }),
      ])
    }
  }
}

export default FireElementalBattlecry
