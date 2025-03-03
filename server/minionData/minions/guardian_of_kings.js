const Minion = require('../minion.js')
const { notifyClient } = require('../../ws.js')
const guardian_of_kings_battlecry = require('../../effectData/effects/guardian_of_kings_battlecry.js')

class guardian_of_kings extends Minion {
  constructor(baseID, uniqueID, player) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new guardian_of_kings_battlecry(player),
    }
  }

  doPlay(gameState) {
    console.log(this.effects.battlecry.requiresTarget)
    if (this.effects.battlecry.requiresTarget) {
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

module.exports = guardian_of_kings
