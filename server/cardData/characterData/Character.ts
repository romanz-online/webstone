import Card from '@card'
import {
  EventType,
  HeroClass,
  Keyword,
  PlayerID,
  Rarity,
  Tribe,
} from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import DeathEvent from '@events/DeathEvent.ts'

class Character extends Card {
  fileName: string
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

  constructor(id: number, player: number, baseData: any) {
    super(id)

    this.id = id
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
      this.id,
      EventType.TriggerDeath,
      (event, done) => {
        this.onTriggerDeath()
        done()
      }
    )
  }

  toString(): string {
    return `${this.name}${this.id}`
  }

  toJSON(): any {
    return {
      id: this.id,
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
      baseManaCost: this.baseMana,
      baseAttack: this.baseAttack,
      baseHealth: this.baseHealth,
      maxHealth: this.maxHealth,
      manaCost: this.mana,
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

  takeDamage(damage: number): number {
    if (this.hasKeyword(Keyword.DivineShield)) {
      this.keywords = this.keywords.filter((k) => k !== Keyword.DivineShield)
      return 0
    }

    this.health -= damage

    // if (target.health < 1) {
    //   // STORE A "killedBy" VALUE HERE IF NEEDED
    // }

    return damage
  }

  onTriggerDeath(): void {
    if (!this.inPlay || this.health > 0) {
      return
    }

    // notifyClient('minionDied', true, { minion: this })

    engine.queueEvent(new DeathEvent(this))

    // CHECK DEATHRATTLE HERE?
  }

  death(): void {}
}

export default Character
