const Minion = require('../minion.js')
const { engine } = require('../../engine.js')
const { notifyClient } = require('../../ws.js')

class mana_wyrm extends Minion {
  constructor(baseID, uniqueID, player) {
    super(baseID, uniqueID, player)

    engine.addGameElementListener(
      this.uniqueID,
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
