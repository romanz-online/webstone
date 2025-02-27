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

    // engine.addGameElementListener(this.minionID, 'minionDied', (data, done) => {
    //   this.onMinionDied(data.minionID)
    //   done()
    // }) // NOT SURE ABOUT THIS ONE; MIGHT BE WRONG DEPENDING ON HOW I IMPLEMENT EVERYTHING ELSE
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

  // onMinionDied(minion) {
  //   if (this.playedIndex === -1) {
  //     return
  //   }

  //   if (minion.minionID !== this.minionID) {
  //     return
  //   }

  //   engine.removeGameElementListener(this.minionID, 'minionPlayed')
  // }
}

module.exports = mana_wyrm
