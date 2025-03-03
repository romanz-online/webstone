const Effect = require('./effect.js')
const EFFECT_ID = require('./effectID.json')
const fireball = require('./effects/fireball.js')

function generateEffect(ID, player) {
  switch (ID) {
    case EFFECT_ID.FIREBALL:
      return new fireball(player)
    default:
      return new Effect(ID, player)
  }
}

module.exports = { generateEffect }
