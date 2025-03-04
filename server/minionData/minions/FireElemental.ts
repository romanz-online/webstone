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
      battlecry: new FireElementalBattlecry(player, this),
    }
  }
}

export default FireElemental
