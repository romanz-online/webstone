import Minion from '@minion'
import { engine } from '@engine'
import Event from '@event'
import { EventType } from '@constants'

class ManaWyrm extends Minion {
  constructor(ID: number, uniqueID: number, player: number) {
    super(ID, uniqueID, player)

    engine.addGameElementListener(
      this.uniqueID,
      EventType.PlayCard,
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

    engine.queueEvent([
      new Event(EventType.ChangeStats, { target: [this], attack: 1 }),
    ])
  }
}

export default ManaWyrm
