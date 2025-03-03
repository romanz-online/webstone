import { GameState } from '../../gameState'
import Minion from '../../minionData/minion'
import Effect from '../effect'
import EFFECT_ID from '../effectID.json'

class FireElementalBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EFFECT_ID.FIRE_ELEMENTAL_BATTLECRY, player, source, null)
  }

  apply(gameState: GameState, source: Minion, target: Minion | null): void {
    if (!target) {
      if (
        this.requiresTarget ||
        (gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
      }
    }

    if (target) {
      target.takeDamage(source, this.getAmount())
      console.log(
        `${source.name} deals ${this.getAmount()} damage to ${target.name}`
      )
    }
  }
}

export default FireElementalBattlecry
