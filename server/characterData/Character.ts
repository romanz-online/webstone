import { engine } from '../Engine'
import { HeroClass, Rarity, Tribe, EventType, PlayerID } from '../constants'
import GameState from '../GameState'
import Effect from '../effectData/Effect'
import { Keyword } from '../constants'

class Character {
  _isHero: boolean
  _isMinion: boolean
  gameState: GameState
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
  keywords: Keyword[]
  effects: { [key: string]: any }

  constructor(uniqueID: number, player: number, baseData: any) {
    this._isHero = false
    this._isMinion = false

    this.uniqueID = uniqueID
    this.playerOwner = player

    this.inPlay = false
    this.attacksThisTurn = 0
    this.canAttack = true

    this.fileName = baseData.fileName || ''
    this.name = baseData.name || '???'
    this.description = baseData.description || ''
    this.class = baseData.class || HeroClass.Neutral
    this.rarity = baseData.rarity || Rarity.Free
    this.tribe = baseData.tribe || Tribe.None
    this.overload = baseData.overload || 0
    this.baseMana = baseData.mana || 0
    this.baseAttack = baseData.attack || 0
    this.baseHealth = baseData.health || 1
    this.maxHealth = baseData.health || 1
    this.mana = baseData.mana || 0
    this.attack = baseData.attack || 0
    this.health = baseData.health || 1
    this.keywords = baseData.keywords || []

    this.effects = {}

    engine.addGameElementListener(
      this.uniqueID,
      EventType.Kill,
      (data, done) => {
        this.onKillMinions()
        done()
      }
    )
  }

  toString(): string {
    return `${this.name}${this.uniqueID}`
  }

  toJSON(): any {
    return {
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
    }
  }

  hasKeyword(keyword: Keyword): boolean {
    return keyword in this.keywords
  }

  getBattlecry(): Effect | null {
    return this.effects.battlecry
  }

  onKillMinions() {
    if (!this.inPlay || this.health > 0) {
      return
    }

    this.inPlay = false

    // notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Character
