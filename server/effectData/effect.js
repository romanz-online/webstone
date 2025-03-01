class Effect {
  constructor(config = {}) {
    this.name = config.name || ''
    this.description = config.description || ''
    this.requiresTarget = config.requiresTarget || false
    this.targetValidator = config.targetValidator || null
  }

  // virtual
  apply(game, source, target = null) {
    throw new Error('apply() method must be implemented by subclasses')
  }

  canTarget(game, source, target) {
    if (!this.requiresTarget) return false
    if (!target) return false
    if (this.targetValidator) {
      return this.targetValidator(game, source, target)
    }
    return true
  }

  getValidTargets(game, source) {
    if (!this.requiresTarget) return []

    const allPossibleTargets = [
      game.playerHero,
      game.opponentHero,
      ...game.playerBoard,
      ...game.opponentBoard,
    ]

    return allPossibleTargets.filter((target) =>
      this.canTarget(game, source, target)
    )
  }
}
