import Character from '@character'
import { EventType, Location } from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import MinionData from '@minionData'

class Minion extends Character {
  location: Location

  constructor(baseID: number, id: number, player: number) {
    super(id, player, MinionData[baseID - 1000])

    this.location = Location.Deck

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
    if (this.location !== Location.Board || this.health > 0) {
      return
    }

    this.location = Location.Graveyard
    // notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Minion
