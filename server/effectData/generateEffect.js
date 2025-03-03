const Effect = require('./effect.js')
const EFFECT_ID = require('./effectID.json')
const fireball = require('./effects/fireball.js')

function generateEffect(ID, owner) {
  switch (ID) {
    case EFFECT_ID.FIREBALL:
      return new fireball(owner)
    case EFFECT_ID.GUARDIAN_OF_KINGS_BATTLECRY:
      return new fireball(owner)
    default:
      return new Effect(ID, owner)
  }
}

module.exports = { generateEffect }
