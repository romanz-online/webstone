const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const { engine } = require('../../engine.js')

class mana_wyrm extends Minion {
  constructor(playerNumber, index) {
    super(MINION_IDS.MANA_WYRM, playerNumber, index)

    engine.addGameElementListener(
      this.minionID,
      'minionPlayed',
      (data, done) => {
        this.onMinionPlayed(data.minionID)
        done()
      }
    )
  }

  onMinionPlayed(minionID) {
    if (this.playedIndex === -1) {
      return
    }

    if (minionID === this.minionID) {
      return
    }

    this.attack += 1
  }
}

module.exports = mana_wyrm
