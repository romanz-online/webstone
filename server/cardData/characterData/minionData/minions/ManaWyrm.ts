import Minion from '@minion'
import { engine } from '@engine'
import { EventType } from '@constants'
import ChangeStatsEvent from '@events/ChangeStatsEvent.ts'
import Effect from '@effect'
import PlayCardEvent from '@events/PlayCardEvent.ts'

class ManaWyrm extends Minion {
  constructor(ID: number, id: number, player: number) {
    super(ID, id, player)

    engine.addGameElementListener(
      this.id,
      EventType.PlayCard,
      (event: PlayCardEvent, done: () => void) => {
        this.onPlaySpell(event)
        done()
      }
    )
  }

  onPlaySpell(event: PlayCardEvent) {
    if (!this.inPlay) {
      return
    }

    if (event.card instanceof Effect) {
      engine.queueEvent(new ChangeStatsEvent(this, [this], 0, 1, 0))
    }
  }

  death() {
    engine.removeGameElementListener(this.id, EventType.PlayCard)
  }
}

export default ManaWyrm
