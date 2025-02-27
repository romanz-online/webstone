const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')

class guardian_of_kings extends Minion {
  constructor(playerNumber, index) {
    super(MINION_IDS.GUARDIAN_OF_KINGS, playerNumber, index)
  }

  onEndTurn(gameState) {
    this.health += 1
    return {
      event: 'changeStats',
      data: {
        minionID: this.minionID,
        stats: [this.mana, this.attack, this.health],
        baseStats: [this.baseMana, this.baseAttack, this.baseHealth],
      },
    }
  }
}

module.exports = guardian_of_kings
