const Minion = require('../minion.js')
const { notifyClient } = require('../../ws.js')
const fire_elemental_battlecry = require('../../effectData/effects/fire_elemental_battlecry.js')

class fire_elemental extends Minion {
  constructor(baseID, uniqueID, owner) {
    super(baseID, uniqueID, owner)

    this.effects = {
      battlecry: new fire_elemental_battlecry(owner),
    }
  }

  doPlay(gameState) {
    // THIS TARGETTING ISN'T QUITE RIGHT YET
    if (
      this.effects.battlecry.canTarget ||
      this.effects.battlecry.requiresTarget
    ) {
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

// FROSTWOLF WARLORD
// {
//   name: 'Battlecry',
//   description:
//     'Gain +1/+1 for each other friendly minion on the battlefield',
//   requiresTarget: false,
//   apply: (gameState, source) => {
//     const friendlyCount = gameState.playerBoard.filter(
//       (minion) => minion !== source
//     ).length
//     source.attack += friendlyCount
//     source.health += friendlyCount
//     source.maxHealth += friendlyCount
//     console.log(
//       `${source.name} gains +${friendlyCount}/+${friendlyCount} from battlecry`
//     )

//     notifyClient('changeStats', true, { minion: this })
//   },
// },

module.exports = fire_elemental
