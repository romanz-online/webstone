import Minion from '../minion'
import { notifyClient } from '../../ws'
import { engine } from '../../engine'

class ManaWyrm extends Minion {
  constructor(ID: number, uniqueID: number, player: number) {
    super(ID, uniqueID, player)

    engine.addGameElementListener(
      this.uniqueID,
      'playMinion',
      (data: any, done: () => void) => {
        this.onPlayMinion(data.minion)
        done()
      }
    )
  }

  onPlayMinion(minion: Minion) {
    if (!this.inPlay || this === minion) {
      return
    }

    this.attack += 1

    notifyClient('changeStats', true, { minion: this })
  }
}

export default ManaWyrm
