const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const { notifyClient } = require('../../ws.js')

class guardian_of_kings extends Minion {
  constructor(minionID, owner) {
    super(MINION_IDS.GUARDIAN_OF_KINGS, minionID, owner)

    this.effects = {
      battlecry: {
        name: 'Battlecry',
        description: 'Deal 2 damage',
        amount: 2,
        requiresTarget: true,
        apply: function (gameState, source, target) {
          if (this.requiresTarget && !target) {
            console.error('Target required for targeted damage effect')
          }

          if (this.requiresTarget) {
            // Single target damage
            target.takeDamage(source, this.amount)
            console.log(
              `${source.name} deals ${this.amount} damage to ${target.name}`
            )
          }
          // else if (this.targetFilter) {
          //   // Multi-target damage based on filter
          //   const targets = this.targetFilter(game, source)
          //   targets.forEach((target) => {
          //     target.health -= this.amount
          //     console.log(
          //       `${source.name} deals ${this.amount} damage to ${target.name}`
          //     )
          //   })
          // }
        },
      },
    }
  }

  doPlay(gameState) {
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
