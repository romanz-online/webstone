const { engine } = require('../engine.js')
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
    engine.addGameElementListener(this.minionID, 'minionDied', (data, done) => {
      this.onMinionDied(data.minionID, data.killerID)
      done()
    })
  }

  onApplyDamage(sourceID, targetID, damage) {
    if (this.playedIndex === -1) {
      return
    }

    if (targetID !== this.minionID) {
      return
    }

    this.health -= damage

    if (this.health < 1) {
      engine.queueEvent('minionDied', {
        minionID: this.minionID,
        killerID: sourceID,
      })
    }
  }

  onAttack(attackerID, targetID) {
    if (this.playedIndex === -1) {
      return
    }

    if (attackerID === this.minionID) {
      engine.queueEvent('applyDamage', {
        sourceID: this.minionID,
        targetID: targetID,
        damage: this.attack,
      })
    } else if (targetID === this.minionID) {
      engine.queueEvent('applyDamage', {
        sourceID: this.minionID,
        targetID: attackerID,
        damage: this.attack,
      })
    }
  }

  onMinionDied(minionID, killerID) {
    if (this.playedIndex === -1) {
      return
    }

    if (minionID !== this.minionID) {
      return
    }

    this.playedIndex = -1
  }
}

module.exports = Minion
