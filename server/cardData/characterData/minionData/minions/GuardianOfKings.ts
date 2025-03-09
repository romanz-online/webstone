import Minion from '@minion'
import GuardianOfKingsBattlecry from '@effects/GuardianOfKingsBattlecry.ts'

class GuardianOfKings extends Minion {
  constructor(baseID: number, id: number, player: number) {
    super(baseID, id, player)

    this.effects = {
      battlecry: new GuardianOfKingsBattlecry(player),
    }
  }
}

export default GuardianOfKings
