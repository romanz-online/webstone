const Minion = require('../minion.js')
const { notifyClient } = require('../../ws.js')
const fire_elemental_battlecry = require('../../effectData/effects/fire_elemental_battlecry.js')

class fire_elemental extends Minion {
  constructor(baseID, uniqueID, player) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new fire_elemental_battlecry(player),
    }
  }

  doPlay(gameState) {
    // THIS TARGETTING ISN'T QUITE RIGHT YET
    if (this.effects.battlecry.canTarget) {
      notifyClient('getTarget', true, { minion: this })
      return true
    } else {
      this.doBattlecry(gameState)
      return false
    }
  }

  doBattlecry(gameState, target) {
    this.effects.battlecry.apply(gameState, this, target)
  }
}

module.exports = fire_elemental
