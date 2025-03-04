import { GameState } from '../../gameState'
import Minion from '../../minionData/minion'
import Effect from '../effect'
import EFFECT_ID from '../effectID.json'

class FireElementalBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EFFECT_ID.FIRE_ELEMENTAL_BATTLECRY, player, source, null)
  }

  apply(): void {
    if (!this.gameState || !this.source) {
      console.error('Missing values to properly execute effect')
    }

    if (!this.target) {
      if (
        this.requiresTarget ||
        (this.gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
      }
    }

    if (this.target) {
      this.target.takeDamage(this.source, this.getAmount())
      console.log(
        `${this.source.name} deals ${this.getAmount()} damage to ${this.target.name}`
      )
    }
  }
}

export default FireElementalBattlecry
