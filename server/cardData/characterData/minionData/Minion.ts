import { engine } from '@engine'
import { EventType } from '@constants'
import Effect from '@effect'
import Character from '@character'
import MinionData from '@minionData'

class Minion extends Character {
  constructor(baseID: number, id: number, player: number) {
    super(id, player, MinionData[baseID - 1000])

    engine.addGameElementListener(
      this.id,
      EventType.TriggerDeath,
      (data, done) => {
        this.onTriggerDeath()
        done()
      }
    )
  }

  getBattlecry(): Effect | null {
    return this.effects.battlecry
  }

  onTriggerDeath() {
    if (!this.inPlay || this.health > 0) {
      return
    }

    this.inPlay = false

    // notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Minion
