const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const { engine } = require('../../engine.js')

class mana_wyrm extends Minion {
  constructor(minionID) {
    super(MINION_IDS.MANA_WYRM, minionID)

    engine.addGameElementListener(
      this.minionID,
      'minionPlayed',
      (data, done) => {
        done(this.onMinionPlayed(data.minionID))
      }
    )
  }

  onMinionPlayed(minionID) {
    if (!this.inPlay) {
      return false
    }

    if (minionID === this.minionID) {
      return false
    }

    this.attack += 1

    return true
  }
}

module.exports = mana_wyrm
