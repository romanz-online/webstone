const EFFECT_ID = require('../effectID.json')
const Effect = require('../effect.js')
/** @typedef {import('../../gameState.js').GameState} GameState */
/** @typedef {import('../../minionData/minion.js').Minion} Minion */

class guardian_of_kings_battlecry extends Effect {
  constructor(player) {
    super(EFFECT_ID.GUARDIAN_OF_KINGS_BATTLECRY, player)
  }

  apply(
    /** @type {GameState} */ gameState,
    /** @type {Minion} */ source,
    /** @type {Minion} */ target
  ) {
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
      this.getAmount()
    )
    gameState.playerHealth += restoreAmount
    console.log(
      `${source.name} heals restores ${restoreAmount} health to player`
    )
  }
}

module.exports = guardian_of_kings_battlecry
