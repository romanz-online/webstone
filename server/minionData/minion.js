const { engine } = require('../engine.js')
const { ATTRIBUTES, MINION_DATA } = require('./baseMinionData.js')

class Minion {
  constructor(minion, minionID) {
    this.baseMinionID = minion[0]
    this.minionFileName = minion[1]

    this.minionID = minionID
    this.inPlay = false
    this.attacksThisTurn = 0

    const { name, description, rarity, tribe, overload, stats, attributes } =
      MINION_DATA[this.baseMinionID]

    Object.assign(this, {
      name,
      description,
      rarity,
      tribe,
      overload,
    })
    ;[this.baseMana, this.baseAttack, this.baseHealth] = stats
    ;[this.mana, this.attack, this.health] = stats

    Object.keys(ATTRIBUTES).forEach((attr) => {
      if (attributes[ATTRIBUTES[attr]]) {
        this[attr.toLowerCase()] = true
      }
    })

    engine.addGameElementListener(this.minionID, 'attack', (data, done) => {
      done(this.onAttack(data.attackerID, data.targetID))
    })

    engine.addGameElementListener(
      this.minionID,
      'applyDamage',
      (data, done) => {
        done(this.onApplyDamage(data.sourceID, data.targetID, data.damage))
      }
    )

    engine.addGameElementListener(this.minionID, 'killMinion', (data, done) => {
      done(this.onKillMinion())
    })

    engine.addGameElementListener(this.minionID, 'minionDied', (data, done) => {
      // this.onMinionDied()
      done(false)
    })
  }

  onApplyDamage(sourceID, targetID, damage) {
    if (!this.inPlay) {
      return false
    }

    if (targetID !== this.minionID) {
      return false
    }

    this.health -= damage

    return true
  }

  onAttack(attackerID, targetID) {
    if (!this.inPlay) {
      return false
    }

    if (attackerID !== this.minionID) {
      return false
    }

    // do stuff
    this.attacksThisTurn++

    return true
  }

  onKillMinion() {
    if (!this.inPlay) {
      return false
    }

    if (this.health > 0) {
      return false
    }

    this.inPlay = false

    engine.queueEvent('minionDied', {
      minionID: this.minionID,
    })

    return true
  }
}

module.exports = Minion
