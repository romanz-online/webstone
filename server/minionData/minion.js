const { ATTRIBUTES, MINION_IDS, MINION_DATA } = require('./baseMinionData.js')

class Minion {
  constructor(minion, playedIndex = -1, minionID = '') {
    this.baseMinionID = minion[0]
    this.minionFileName = minion[1]

    this.minionID = minionID
    this.playedIndex = playedIndex

    const { name, description, rarity, tribe, overload, stats, attributes } =
      MINION_DATA[this.baseMinionID]

    Object.assign(this, {
      name,
      description,
      rarity,
      tribe,
      overload,
      isDamaged: false,
    })

    ;[this.baseMana, this.baseAttack, this.baseHealth] = stats
    ;[this.mana, this.attack, this.health] = stats

    Object.keys(ATTRIBUTES).forEach((attr) => {
      this[attr.toLowerCase()] = attributes[ATTRIBUTES[attr]] || false
    })
  }

  battlecry(gameState) {}
  chooseOne(gameState) {}
  combo(gameState) {}
  aura(gameState) {}
  deathrattle(gameState) {}

  onStartTurn(gameState) {}
  onEndTurn(gameState) {}

  onMinionPlayed(gameState, minion) {}
  onMinionSummoned(gameState, minion) {}
  onMinionDied(gameState, minion) {}
  onMinionDamaged(gameState, minion) {}
  onSpellPlayed(gameState, spell) {}
  onAfterSpellPlayed(gameState, minion) {}
  onCharacterHealed(gameState, minion) {}
}

module.exports = Minion
