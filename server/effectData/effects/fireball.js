const Effect = require('../effect.js')
const EFFECT_ID = require('../effectID.json')

class fireball extends Effect {
  constructor(owner) {
    super(EFFECT_ID.FIREBALL, owner)
  }

  apply(game, source, target) {
    // if (this.requiresTarget && !target) {
    //   throw new Error('Target required for targeted damage effect')
    // }
    // if (this.requiresTarget) {
    //   // Single target damage
    //   target.health -= this.amount
    //   console.log(
    //     `${source.name} deals ${this.amount} damage to ${target.name}`
    //   )
    // } else if (this.targetFilter) {
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

module.exports = fireball
