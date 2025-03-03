import { engine } from '../engine'
import { notifyClient } from '../ws'
import MINION_DATA from './baseMinionData'
import { CLASS, RARITY, TRIBE, EFFECT_TYPE } from '../constants'
import { GameState } from '../gameState'
import { gameState } from '../wsEvents'

class Minion {
  baseID: number
  fileName: string
  uniqueID: number
  player: number
  inPlay: boolean
  attacksThisTurn: number
  canAttack: boolean
  name: string
  description: string
  class: CLASS
  rarity: RARITY
  tribe: TRIBE
  overload: number
  baseMana: number
  baseAttack: number
  baseHealth: number
  maxHealth: number
  mana: number
  attack: number
  health: number
  charge: boolean
  taunt: boolean
  divineShield: boolean
  stealth: boolean
  windfury: boolean
  elusive: boolean
  poison: boolean
  effects: { [key: string]: any }

  constructor(baseID: number, uniqueID: number, player: number) {
    const baseData = MINION_DATA[baseID - 1000]

    this.baseID = baseID
    this.uniqueID = uniqueID
    this.player = player

    this.inPlay = false
    this.attacksThisTurn = 0
    this.canAttack = true

    this.fileName = baseData.fileName || ''
    this.name = baseData.name || '???'
    this.description = baseData.description || ''
    this.class = baseData.class || CLASS.NEUTRAL
    this.rarity = baseData.rarity || RARITY.FREE
    this.tribe = baseData.tribe || TRIBE.NONE
    this.overload = baseData.overload || 0
    this.baseMana = baseData.mana || 0
    this.baseAttack = baseData.attack || 0
    this.baseHealth = baseData.health || 1
    this.maxHealth = baseData.health || 1
    this.mana = baseData.mana || 0
    this.attack = baseData.attack || 0
    this.health = baseData.health || 1
    this.charge = baseData.charge || false
    this.taunt = baseData.taunt || false
    this.divineShield = baseData.divineShield || false
    this.stealth = baseData.stealth || false
    this.windfury = baseData.windfury || false
    this.elusive = baseData.elusive || false
    this.poison = baseData.poison || false

    this.effects = {}

    engine.addGameElementListener(this.uniqueID, 'killMinion', (data, done) => {
      this.onKillMinion()
      done()
    })
  }

  doBattlecry(gameState: GameState, target: Minion | null): void {}

  doPlay(gameState: GameState) {
    engine.queueEvent([
      {
        event: 'minionPlayed',
        data: {
          minion: this,
        },
      },
    ])
  }

  doAttack(target: Minion) {
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

  receiveAttack(attacker: Minion) {
    if (!this.inPlay) {
      return
    }

    this.takeDamage(attacker, attacker.attack)
    attacker.takeDamage(this, this.attack)
  }

  takeDamage(source: Minion, damage: number) {
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

export default Minion
