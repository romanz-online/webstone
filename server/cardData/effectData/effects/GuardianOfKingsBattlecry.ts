import GameState from '@gameState'
import Minion from '@minion'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }

class GuardianOfKingsBattlecry extends Effect {
  constructor(player: number, source: Minion) {
    super(EffectID.GUARDIAN_OF_KINGS_BATTLECRY, -1, player)
  }

  apply(source: Minion, target: Minion | null): void {
    if (!target) {
      if (
        this.requiresTarget ||
        (this.gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
      }
    }

    const restoreAmount = Math.min(
      30 - this.gameState.playerHealth,
      this.getAmount()[0]
    )
    this.gameState.playerHealth += restoreAmount
    console.log(`${source.name} restores ${restoreAmount} health to player`)
  }
}

export default GuardianOfKingsBattlecry
