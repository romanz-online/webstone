const Minion = require('../minion.js')
const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('../baseMinionData.js')
const { engine } = require('../../engine.js')
const { notifyClient } = require('../../ws.js')

class mana_wyrm extends Minion {
  constructor(minionID, owner) {
    super(MINION_IDS.MANA_WYRM, minionID, owner)

    engine.addGameElementListener(
      this.minionID,
      'minionPlayed',
      (data, done) => {
        this.onMinionPlayed(data.minion)
        done()
      }
    )
  }

  onMinionPlayed(minion) {
    if (!this.inPlay || this === minion) {
      return
    }

    this.attack += 1

    notifyClient('changeStats', true, { minion: this })
  }
}

module.exports = mana_wyrm
