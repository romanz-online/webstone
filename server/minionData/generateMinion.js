const MINION_ID = require('./minionID.json')
const Minion = require('./minion.js')
const guardian_of_kings = require('./minions/guardian_of_kings.js')
const mana_wyrm = require('./minions/mana_wyrm.js')
const fire_elemental = require('./minions/fire_elemental.js')

function generateMinion(ID, uniqueID, owner) {
  switch (ID) {
    // ONLY NEED TO ADD CASES FOR MINIONS THAT HAVE TEXT OR PROPERTIES
    // E.G. DON'T NEED A CASE FOR BLOODFEN RAPTOR
    case MINION_ID.MANA_WYRM:
      return new mana_wyrm(ID, uniqueID, owner)
    case MINION_ID.GUARDIAN_OF_KINGS:
      return new guardian_of_kings(ID, uniqueID, owner)
    case MINION_ID.FIRE_ELEMENTAL:
      return new fire_elemental(ID, uniqueID, owner)
    default:
      return new Minion(ID, uniqueID, owner)
  }
}

module.exports = { generateMinion }
