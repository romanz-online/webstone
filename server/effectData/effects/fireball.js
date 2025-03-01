class fireball extends Effect {
  constructor() {
    super({
      name: 'Fireball',
      description: `Deal ${config.amount} damage`,
      requiresTarget: config.requiresTarget || true,
      targetValidator: config.targetValidator,
      ...config,
    })
    this.amount = 6
  }

  apply(game, source, target) {
    if (this.requiresTarget && !target) {
      throw new Error('Target required for targeted damage effect')
    }

    if (this.requiresTarget) {
      // Single target damage
      target.health -= this.amount
      console.log(
        `${source.name} deals ${this.amount} damage to ${target.name}`
      )
    } else if (this.targetFilter) {
      // Multi-target damage based on filter
      const targets = this.targetFilter(game, source)
      targets.forEach((target) => {
        target.health -= this.amount
        console.log(
          `${source.name} deals ${this.amount} damage to ${target.name}`
        )
      })
    }
  }
}
