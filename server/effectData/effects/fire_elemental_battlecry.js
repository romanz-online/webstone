const EFFECT_ID = require('../effectID.json')
const Effect = require('../effect.js')
/** @typedef {import('../../gameState.js').GameState} GameState */
/** @typedef {import('../../minionData/minion.js').Minion} Minion */

class fire_elemental_battlecry extends Effect {
  constructor(player) {
    super(EFFECT_ID.FIRE_ELEMENTAL_BATTLECRY, player)
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

    target.takeDamage(source, this.getAmount())
    console.log(
      `${source.name} deals ${this.getAmount()} damage to ${target.name}`
    )
  }
}

module.exports = fire_elemental_battlecry
