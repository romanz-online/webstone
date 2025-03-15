import { CardLocation, EventType } from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import ChangeStatsEvent from '@events/ChangeStatsEvent.ts'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import Minion from '@minion'

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
    if (this.location !== CardLocation.Board) {
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
