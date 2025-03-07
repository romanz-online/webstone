import { engine } from '../../Engine'
import { EventType } from '../../constants'
import Effect from '../../effectData/Effect'
import Character from '../Character'
import MinionData from './BaseMinionData'

class Minion extends Character {
  _isMinion: boolean

  constructor(baseID: number, uniqueID: number, player: number) {
    super(uniqueID, player, MinionData[baseID - 1000])

    this._isMinion = true

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
