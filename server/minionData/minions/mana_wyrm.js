const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const engine = require('../../engine')

class mana_wyrm extends Minion {
  constructor() {
    super(MINION_IDS.MANA_WYRM)

    engine.addCardListener(this.minionID, 'minionPlayed', (data, done) => {
      this.onMinionPlayed(data.gameState, data.minion)
      done()
    })

    engine.addCardListener(this.minionID, 'minionDied', (data, done) => {
      this.onMinionDied(data.gameState, data.minion)
      done()
    }) // NOT SURE ABOUT THIS ONE; MIGHT BE WRONG DEPENDING ON HOW I IMPLEMENT EVERYTHING ELSE
  }

  onMinionPlayed(gameState, minion) {
    if (this.playedIndex === -1) {
      return
    }

    if (minion.minionID === this.minionID) {
      return
    }

    this.attack += 1
  }

  onMinionDied(gameState, minion) {
    if (this.playedIndex === -1) {
      return
    }

    if (minion.minionID !== this.minionID) {
      return
    }

    engine.removeCardListeners(this.minionID)
  }
}

module.exports = mana_wyrm
