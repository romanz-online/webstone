const { engine } = require('../engine.js')
const { notifyClient } = require('../ws.js')
const { ATTRIBUTES, MINION_DATA } = require('./baseMinionData.js')

class Minion {
  constructor(minion, minionID, owner) {
    this.baseMinionID = minion[0]
    this.minionFileName = minion[1]

    this.minionID = minionID
    this.owner = owner

    this.inPlay = false
    this.attacksThisTurn = 0
    this.canAttack = true

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
      this.onAttack(data.attackerID, data.targetID)
      done()
    })

    engine.addGameElementListener(
      this.minionID,
      'applyDamage',
      (data, done) => {
        this.onApplyDamage(data.sourceID, data.targetID, data.damage)
        done()
      }
    )

    engine.addGameElementListener(this.minionID, 'killMinion', (data, done) => {
      this.onKillMinion()
      done()
    })

    engine.addGameElementListener(this.minionID, 'minionDied', (data, done) => {
      // this.onMinionDied()
      done()
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

    notifyClient('applyDamage', true, gameState.toJSON())

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

    if (
      (this.attacksThisTurn > 0 && !this.windfury) ||
      (this.attacksThisTurn > 1 && this.windfury)
    ) {
      this.canAttack = false
    }

    notifyClient('attack', true, gameState.toJSON())

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

    notifyClient('minionDied', true, gameState.toJSON())

    return true
  }
}

module.exports = Minion
