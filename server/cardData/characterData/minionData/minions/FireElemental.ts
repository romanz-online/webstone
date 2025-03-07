import Minion from '@minion'
import FireElementalBattlecry from '@effects/FireElementalBattlecry'

class FireElemental extends Minion {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new FireElementalBattlecry(player, this),
    }
  }
}

export default FireElemental
