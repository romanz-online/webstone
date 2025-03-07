import { engine } from '@engine'
import { EventType } from '@constants'
import Effect from '@effect'
import Character from '@character'
import MinionData from '@minionData'

class Minion extends Character {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(uniqueID, player, MinionData[baseID - 1000])

    engine.addGameElementListener(
      this.uniqueID,
      EventType.Kill,
      (data, done) => {
        this.onKillMinions()
        done()
      }
    )
  }

  getBattlecry(): Effect | null {
    return this.effects.battlecry
  }

  onKillMinions() {
    if (!this.inPlay || this.health > 0) {
      return
    }

    this.inPlay = false

    // notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Minion
