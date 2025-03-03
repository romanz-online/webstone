const { EFFECT_DATA } = require('./baseEffectData.js')

class Effect {
  constructor(baseID, player) {
    const baseData = EFFECT_DATA[baseID - 2000]
    this.baseID = baseID
    this.player = player

    this.fileName = baseData.fileName
    this.class = baseData.class
    this.name = baseData.name
    this.baseDescription = baseData.baseDescription
    this.rarity = baseData.rarity
    this.cost = baseData.cost
    this.amount = baseData.amount
    this.affectedBySpellpower = baseData.affectedBySpellpower
    this.overload = baseData.overload
    this.canTarget = baseData.canTarget
    this.requiresTarget = baseData.requiresTarget
    this.obtainable = baseData.obtainable

    // this.targetValidator = config.targetValidator || null
  }

  getAmount() {
    return this.amount // + gameState.spellpower * gameState.prophetVelenAura
  }

  getDescription() {
    let desc = this.baseDescription
    for (let i = 0; i < (this.amount.length || 0); i++) {
      desc.replaceAll(`{amount${i}}`, this.amount[i])
    }
    desc.replaceAll('{overload}', this.overload)
    return desc
  }

  // virtual
  apply(gameState, source, target = null) {
    throw new Error('apply() method must be implemented by subclasses')
  }

  // canTarget(game, source, target) {
  //   if (!this.requiresTarget) return false
  //   if (!target) return false
  //   if (this.targetValidator) {
  //     return this.targetValidator(game, source, target)
  //   }
  //   return true
  // }

  // getValidTargets(game, source) {
  //   if (!this.requiresTarget) return []

  //   const allPossibleTargets = [
  //     game.playerHero,
  //     game.opponentHero,
  //     ...game.playerBoard,
  //     ...game.opponentBoard,
  //   ]

  //   return allPossibleTargets.filter((target) =>
  //     this.canTarget(game, source, target)
  //   )
  // }
}

module.exports = Effect
