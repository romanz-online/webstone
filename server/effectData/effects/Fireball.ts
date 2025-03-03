import { GameState } from '../../gameState'
import Minion from '../../minionData/minion'
import Effect from '../effect'
import * as EFFECT_ID from '../effectID.json'

class Fireball extends Effect {
  constructor(player: number, source: Minion) {
    super(EFFECT_ID.FIREBALL, player, source, null)
  }

  apply(game: GameState, source: Minion, target: Minion | null): void {
    // if (this.requiresTarget && !target) {
    //   throw new Error('Target required for targeted damage effect')
    // }
    // if (this.requiresTarget) {
    //   // Single target damage
    //   target.health -= this.amount
    //   console.log(
    //     `${source.name} deals ${this.amount} damage to ${target.name}`
    //   )
    // } else if (this.targetFilter) {
    //   // Multi-target damage based on filter
    //   const targets = this.targetFilter(game, source)
    //   targets.forEach((target) => {
    //     target.health -= this.amount
    //     console.log(
    //       `${source.name} deals ${this.amount} damage to ${target.name}`
    //     )
    //   })
    // }
  }
}

export default Fireball
