const { ATTRIBUTES, MINION_DATA } = require('./baseMinionData.js')

class Minion {
  constructor(minion, playerNumber, index) {
    this.baseMinionID = minion[0]
    this.minionFileName = minion[1]

    this.minionID = `${playerNumber}-${this.baseMinionID}-${index}`
    this.playedIndex = -1

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
}

module.exports = Minion
