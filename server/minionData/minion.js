const { engine } = require('../engine.js')
const { notifyClient } = require('../ws.js')
const { ATTRIBUTES, MINION_DATA } = require('./baseMinionData.js')

class Minion {
  constructor(baseID, uniqueID, owner) {
    const baseData = MINION_DATA[baseID - 1000]

    this.baseID = baseID
    this.fileName = baseData.fileName

    this.uniqueID = uniqueID
    this.owner = owner

    this.inPlay = false
    this.attacksThisTurn = 0
    this.canAttack = true // CHANGE TO FALSE WHEN NOT DEBUGGING SAME-TURN ATTACKS

    this.name = baseData.name
    this.description = baseData.description
    this.class = baseData.class
    this.rarity = baseData.rarity
    this.tribe = baseData.tribe
    this.overload = baseData.overload

    this.baseMana = baseData.stats[0]
    this.baseAttack = baseData.stats[1]
    this.baseHealth = baseData.stats[2]
    this.maxHealth = baseData.stats[2]
    this.mana = baseData.stats[0]
    this.attack = baseData.stats[1]
    this.health = baseData.stats[2]

    this.effects = {} // UPDATE WITH RELEVANT EFFECTS LIKE BATTLECRIES
    // e.g. this.effects = { battlecry: fireballEffect() }

    Object.keys(ATTRIBUTES).forEach((attr) => {
      if (baseData.attributes[ATTRIBUTES[attr]]) {
        this[attr.toLowerCase()] = true
      }
    })

    engine.addGameElementListener(this.uniqueID, 'killMinion', (data, done) => {
      this.onKillMinion()
      done()
    })
  }

  doPlay() {
    engine.queueEvent([
      {
        event: 'minionPlayed',
        data: {
          minion: this,
        },
      },
    ])
  }

  doAttack(target) {
    if (!this.inPlay) {
      return
    }

    this.attacksThisTurn++

    if (
      (this.attacksThisTurn > 0 && !this.windfury) ||
      (this.attacksThisTurn > 1 && this.windfury)
    ) {
      this.canAttack = false
    }

    target.receiveAttack(this)
  }

  receiveAttack(attacker) {
    if (!this.inPlay) {
      return
    }

    this.takeDamage(attacker, attacker.attack)
    attacker.takeDamage(this, this.attack)
  }

  takeDamage(source, damage) {
    // CHECK DIVINE SHIELD
    // CHECK POISON

    this.health -= damage

    if (this.health < 1) {
      // STORE A "killedBy" VALUE HERE IF NEEDED
    }

    notifyClient('applyDamage', true, { minion: this, damage: damage })
  }

  onKillMinion() {
    if (!this.inPlay || this.health > 0) {
      return
    }

    this.inPlay = false

    notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

module.exports = Minion
