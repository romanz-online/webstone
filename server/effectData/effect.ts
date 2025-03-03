import EFFECT_DATA from './baseEffectData'
import { GameState } from '../gameState'
import Minion from '../minionData/minion'
import { CLASS, RARITY, TRIBE, EFFECT_TYPE } from '../constants'

class Effect {
  baseID: number
  player: number
  source: Minion
  target: Minion | null
  fileName: string
  type: EFFECT_TYPE
  class: CLASS
  name: string
  baseDescription: string
  rarity: RARITY
  cost: number
  amount: number[]
  affectedBySpellpower: boolean
  overload: number
  canTarget: boolean
  requiresTarget: boolean
  obtainable: boolean

  constructor(
    baseID: number,
    player: number,
    source: Minion,
    target: Minion | null
  ) {
    const baseData = EFFECT_DATA[baseID - 2000]
    this.baseID = baseID
    this.player = player
    this.source = source
    this.target = target

    this.fileName = baseData.fileName || ''
    this.type = baseData.type || EFFECT_TYPE.GENERIC
    this.class = baseData.class || CLASS.NEUTRAL
    this.name = baseData.name || '???'
    this.baseDescription = baseData.baseDescription || ''
    this.rarity = baseData.rarity || RARITY.FREE
    this.cost = baseData.cost || 0
    this.amount = baseData.amount || [0]
    this.affectedBySpellpower = baseData.affectedBySpellpower || false
    this.overload = baseData.overload || 0
    this.canTarget = baseData.canTarget || false
    this.requiresTarget = baseData.requiresTarget || false
    this.obtainable = baseData.obtainable || false
  }

  getAmount(): number {
    return this.amount[0] // Assuming you always use the first element of the amount array
  }

  getDescription(): string {
    let desc = this.baseDescription
    for (let i = 0; i < this.amount.length; i++) {
      desc = desc.replaceAll(`{amount${i}}`, this.amount[i].toString())
    }
    desc = desc.replaceAll('{overload}', this.overload.toString())
    return desc
  }

  apply(gameState: GameState, source: Minion, target: Minion | null): void {
    throw new Error('apply() method must be implemented by subclasses')
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
