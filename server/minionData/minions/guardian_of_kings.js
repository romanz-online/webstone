const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const { notifyClient } = require('../../ws.js')

class guardian_of_kings extends Minion {
  constructor(minionID, owner) {
    super(MINION_IDS.GUARDIAN_OF_KINGS, minionID, owner)

    this.effects = {
      battlecry: {
        name: 'Battlecry',
        description:
          'Gain +1/+1 for each other friendly minion on the battlefield',
        requiresTarget: false,
        apply: (gameState, source) => {
          const friendlyCount = gameState.playerBoard.filter(
            (minion) => minion !== source
          ).length
          source.attack += friendlyCount
          source.health += friendlyCount
          source.maxHealth += friendlyCount
          console.log(
            `${source.name} gains +${friendlyCount}/+${friendlyCount} from battlecry`
          )

          notifyClient('changeStats', true, { minion: this })
        },
      },
    }
  }

  doPlay(gameState) {
    this.effects.battlecry.apply(gameState, this)
  }
}

module.exports = guardian_of_kings
