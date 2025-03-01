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
    this.canAttack = true // CHANGE TO FALSE WHEN NOT DEBUGGING SAME-TURN ATTACKS

    this.name = MINION_DATA[this.baseMinionID].name
    this.description = MINION_DATA[this.baseMinionID].description
    this.rarity = MINION_DATA[this.baseMinionID].rarity
    this.tribe = MINION_DATA[this.baseMinionID].tribe
    this.overload = MINION_DATA[this.baseMinionID].overload

    this.baseMana = MINION_DATA[this.baseMinionID].stats[0]
    this.baseAttack = MINION_DATA[this.baseMinionID].stats[1]
    this.baseHealth = MINION_DATA[this.baseMinionID].stats[2]
    this.mana = MINION_DATA[this.baseMinionID].stats[0]
    this.attack = MINION_DATA[this.baseMinionID].stats[1]
    this.health = MINION_DATA[this.baseMinionID].stats[2]

    this.effects = {} // UPDATE WITH RELEVANT EFFECTS LIKE BATTLECRIES
    // e.g. this.effects = { battlecry: fireballEffect() }

    Object.keys(ATTRIBUTES).forEach((attr) => {
      if (MINION_DATA[this.baseMinionID].attributes[ATTRIBUTES[attr]]) {
        this[attr.toLowerCase()] = true
      }
    })

    engine.addGameElementListener(this.minionID, 'killMinion', (data, done) => {
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
