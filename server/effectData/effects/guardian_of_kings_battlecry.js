const Effect = require('../effect.js')
const EFFECT_ID = require('../effectID.json')

class guardian_of_kings_battlecry extends Effect {
  constructor(owner) {
    super(EFFECT_ID.GUARDIAN_OF_KINGS_BATTLECRY, owner)
  }

  apply(gameState, source, target) {
    if (this.requiresTarget && !target) {
      console.error('Target required for targeted damage effect')
    }

    if (this.requiresTarget) {
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

module.exports = guardian_of_kings_battlecry
