const { MINION_IDS } = require('./baseMinionData.js')
const Minion = require('./minion.js')
const guardian_of_kings = require('./minions/guardian_of_kings.js')
const mana_wyrm = require('./minions/mana_wyrm.js')

function generateMinion(baseMinionID, minionID, owner) {
  switch (baseMinionID) {
    // ONLY NEED TO ADD CASES FOR MINIONS THAT HAVE TEXT OR PROPERTIES
    case MINION_IDS.MANA_WYRM:
      return new mana_wyrm(minionID, owner)
    case MINION_IDS.GUARDIAN_OF_KINGS:
      return new guardian_of_kings(minionID, owner)
    default:
      return new Minion(baseMinionID, minionID, owner)
  }
}

module.exports = { generateMinion }
