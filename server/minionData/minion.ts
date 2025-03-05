import { engine } from '../Engine'
import { notifyClient } from '../ws'
import MINION_DATA from './baseMinionData'
import { HeroClass, Rarity, Tribe, EventType, PlayerID } from '../constants'
import GameState from '../GameState'
import Effect from '../effectData/effect'

class Minion {
  gameState: GameState
  baseID: number
  fileName: string
  uniqueID: number
  playerOwner: PlayerID
  inPlay: boolean
  attacksThisTurn: number
  canAttack: boolean
  name: string
  description: string
  class: HeroClass
  rarity: Rarity
  tribe: Tribe
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
    this.playerOwner = player

    this.inPlay = false
    this.attacksThisTurn = 0
    this.canAttack = true

    this.fileName = baseData.fileName || ''
    this.name = baseData.name || '???'
    this.description = baseData.description || ''
    this.class = baseData.class || HeroClass.NEUTRAL
    this.rarity = baseData.rarity || Rarity.FREE
    this.tribe = baseData.tribe || Tribe.NONE
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

    engine.addGameElementListener(
      this.uniqueID,
      EventType.KillMinion,
      (data, done) => {
        this.onKillMinions()
        done()
      }
    )
  }

  toJSON(): any {
    return {
      baseID: this.baseID,
      uniqueID: this.uniqueID,
      player: this.playerOwner,
      inPlay: this.inPlay,
      attacksThisTurn: this.attacksThisTurn,
      canAttack: this.canAttack,
      fileName: this.fileName,
      name: this.name,
      description: this.description,
      class: this.class,
      rarity: this.rarity,
      tribe: this.tribe,
      overload: this.overload,
      baseMana: this.mana,
      baseAttack: this.attack,
      baseHealth: this.health,
      maxHealth: this.health,
      mana: this.mana,
      attack: this.attack,
      health: this.health,
      charge: this.charge,
      taunt: this.taunt,
      divineShield: this.divineShield,
      stealth: this.stealth,
      windfury: this.windfury,
      elusive: this.elusive,
      poison: this.poison,
    }
  }

  getBattlecry(): Effect | null {
    return this.effects.battlecry
  }

  onKillMinions() {
    if (!this.inPlay || this.health > 0) {
      return
    }

    this.inPlay = false

    notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Minion
