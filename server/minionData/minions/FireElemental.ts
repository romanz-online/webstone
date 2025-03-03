import Minion from '../minion'
import { notifyClient } from '../../ws'
import FireElementalBattlecry from '../../effectData/effects/FireElementalBattlecry'

class FireElemental extends Minion {
  effects: {
    battlecry: FireElementalBattlecry
  }

  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new FireElementalBattlecry(player),
    }
  }

  doPlay(gameState: any): boolean {
    // THIS TARGETTING ISN'T QUITE RIGHT YET
    if (this.effects.battlecry.canTarget) {
      notifyClient('getTarget', true, { minion: this })
      return true
    } else {
      this.doBattlecry(gameState, null)
      return false
    }
  }

  doBattlecry(gameState: any, target: any): void {
    this.effects.battlecry.apply(gameState, this, target)
  }
}

export default FireElemental
