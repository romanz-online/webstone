import Minion from '../minion'
import { notifyClient } from '../../ws'
import { engine } from '../../engine'

class ManaWyrm extends Minion {
  constructor(ID: number, uniqueID: number, player: number) {
    super(ID, uniqueID, player)

    engine.addGameElementListener(
      this.uniqueID,
      'minionPlayed',
      (data: any, done: () => void) => {
        this.onMinionPlayed(data.minion)
        done()
      }
    )
  }

  onMinionPlayed(minion: Minion) {
    if (!this.inPlay || this === minion) {
      return
    }

    this.attack += 1

    notifyClient('changeStats', true, { minion: this })
  }
}

export default ManaWyrm
