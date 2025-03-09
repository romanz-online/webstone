import Minion from '@minion'
import FireElementalBattlecry from '@effects/FireElementalBattlecry.ts'

class FireElemental extends Minion {
  constructor(baseID: number, id: number, player: number) {
    super(baseID, id, player)

    this.effects = {
      battlecry: new FireElementalBattlecry(player),
    }
  }
}

export default FireElemental
