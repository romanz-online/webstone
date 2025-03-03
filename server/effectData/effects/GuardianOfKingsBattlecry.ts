import { GameState } from '../../gameState'
import Minion from '../../minionData/minion'
import Effect from '../effect'
import * as EFFECT_ID from '../effectID.json'

class GuardianOfKingsBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EFFECT_ID.GUARDIAN_OF_KINGS_BATTLECRY, player, source, null)
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

    const restoreAmount = Math.min(
      30 - gameState.playerHealth,
      this.getAmount()[0]
    )
    gameState.playerHealth += restoreAmount
    console.log(`${source.name} restores ${restoreAmount} health to player`)
  }
}

export default GuardianOfKingsBattlecry
