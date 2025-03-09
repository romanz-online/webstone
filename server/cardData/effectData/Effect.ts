import EffectData from '@effectData'
import { HeroClass, Rarity, EffectType, PlayerID } from '@constants'
import Card from '@card'
import Character from '@character'

class Effect extends Card {
  baseID: number
  playerOwner: PlayerID
  fileName: string
  type: EffectType
  class: HeroClass
  name: string
  baseDescription: string
  rarity: Rarity
  manaCost: number
  amount: number[]
  affectedBySpellpower: boolean
  overload: number
  canTarget: boolean
  requiresTarget: boolean
  obtainable: boolean

  constructor(baseID: number, id: number, player: number) {
    super(id)
    const baseData = EffectData[baseID - 2000]
    this.baseID = baseID
    this.playerOwner = player

    this.fileName = baseData.fileName || ''
    this.type = baseData.type || EffectType.Generic
    this.class = baseData.class || HeroClass.Neutral
    this.name = baseData.name || '???'
    this.baseDescription = baseData.baseDescription || ''
    this.rarity = baseData.rarity || Rarity.Free
    this.manaCost = baseData.cost || 0
    this.amount = baseData.amount || [0]
    this.affectedBySpellpower = baseData.affectedBySpellpower || false
    this.overload = baseData.overload || 0
    this.canTarget = baseData.canTarget || false
    this.requiresTarget = baseData.requiresTarget || false
    this.obtainable = baseData.obtainable || false
  }

  toJSON(): any {
    return {
      baseID: this.baseID,
      player: this.playerOwner,
      fileName: this.fileName,
      type: this.type,
      class: this.class,
      name: this.name,
      description: this.getDescription(),
      rarity: this.rarity,
      cost: this.manaCost,
      amount: this.getAmount(),
      affectedBySpellpower: this.affectedBySpellpower,
      overload: this.overload,
      canTarget: this.canTarget,
      requiresTarget: this.requiresTarget,
      obtainable: this.obtainable,
    }
  }

  getAmount(): number {
    return this.amount[0]
  }

  getDescription(): string {
    let desc = this.baseDescription
    for (let i = 0; i < this.amount.length; i++) {
      desc = desc.replaceAll(`{amount${i}}`, this.amount[i].toString())
    }
    desc = desc.replaceAll('{overload}', this.overload.toString())
    return desc
  }

  apply(source: Character, target: Character | null): void {
    throw new Error('apply() method must be implemented by subclasses')
  }

  validateTarget(target: Character): boolean {
    return true
  }
}

export default Effect

// canTarget(game, source, target) {
//   if (!this.requiresTarget) return false
//   if (!target) return false
//   if (this.targetValidator) {
//     return this.targetValidator(game, source, target)
//   }
//   return true
// }

// getValidTargets(game, source) {
//   if (!this.requiresTarget) return []

//   const allPossibleTargets = [
//     game.playerHero,
//     game.opponentHero,
//     ...game.playerBoard,
//     ...game.opponentBoard,
//   ]

//   return allPossibleTargets.filter((target) =>
//     this.canTarget(game, source, target)
//   )
// }
