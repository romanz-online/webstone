const { MINION_IDS } = require('./baseMinionData.js')
const Minion = require('./minion.js')
const guardian_of_kings = require('./minions/guardian_of_kings.js')
const mana_wyrm = require('./minions/mana_wyrm.js')

function generateMinion(baseMinionID, playerNumber, index) {
  switch (baseMinionID) {
    case MINION_IDS.MANA_WYRM:
      return new mana_wyrm(playerNumber, index)
    case MINION_IDS.GUARDIAN_OF_KINGS:
      return new guardian_of_kings(playerNumber, index)
    default:
      return new Minion(baseMinionID, playerNumber, index)
  }
}

module.exports = { generateMinion }
