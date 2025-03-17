import {
  CardLocation,
  HeroClass,
  Keyword,
  PlayerID,
  Rarity,
  Tribe,
} from './constants.ts'

class MinionModel {
  id: number
  fileName: string
  playerOwner: PlayerID
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
  location: CardLocation

  constructor(data: any) {
    this.id = data.id
    this.fileName = data.fileName
    this.playerOwner = data.playerOwner
    this.attacksThisTurn = data.attacksThisTurn
    this.canAttack = data.canAttack
    this.name = data.name
    this.description = data.description
    this.class = data.class
    this.rarity = data.rarity
    this.tribe = data.tribe
    this.overload = data.overload
    this.baseMana = data.baseMana
    this.baseAttack = data.baseAttack
    this.baseHealth = data.baseHealth
    this.maxHealth = data.maxHealth
    this.mana = data.mana
    this.attack = data.attack
    this.health = data.health
    this.keywords = data.keywords
    this.location = data.location
  }
}

export default MinionModel
