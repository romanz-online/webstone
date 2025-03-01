const guardian_of_kings_battlecry = {
  name: 'Battlecry',
  description: 'Deal 2 damage',
  amount: 2,
  requiresTarget: true,
  apply: function (gameState, source, target) {
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
  },
}

module.exports = guardian_of_kings_battlecry
