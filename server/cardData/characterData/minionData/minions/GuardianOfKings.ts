import Minion from '@minion'
import GuardianOfKingsBattlecry from '@effects/GuardianOfKingsBattlecry'

class GuardianOfKings extends Minion {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new GuardianOfKingsBattlecry(player, this),
    }
  }
}

export default GuardianOfKings
