const Effect = require('../effect.js')
const EFFECT_ID = require('../effectID.json')

class fire_elemental_battlecry extends Effect {
  constructor(owner) {
    super(EFFECT_ID.FIRE_ELEMENTAL_BATTLECRY, owner)
  }

  apply(gameState, source, target) {
    if ((this.canTarget || this.requiresTarget) && !target) {
      console.error('Target required for targeted damage effect')
    }

    if (this.canTarget || this.requiresTarget) {
      // Single target damage
      target.takeDamage(source, this.amount)
      console.log(
        `${source.name} deals ${this.amount} damage to ${target.name}`
      )
    }
    // else if (this.targetFilter) {
    //   // Multi-target damage based on filter
    //   const targets = this.targetFilter(game, source)
    //   targets.forEach((target) => {
    //     target.health -= this.amount
    //     console.log(
    //       `${source.name} deals ${this.amount} damage to ${target.name}`
    //     )
    //   })
    // }
  }
}

module.exports = fire_elemental_battlecry
