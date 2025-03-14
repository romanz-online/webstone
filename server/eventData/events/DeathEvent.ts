import Character from '@character'
import { EventType, Location } from '@constants'
import Event from '@event'
import Minion from '@minion'
import { notifyClient } from '@ws'

class DeathEvent extends Event {
  target: Character

  constructor(target: Character) {
    super(EventType.Death)
    this.target = target
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    if (this.target instanceof Minion) {
      this.target.location = Location.Graveyard
    }

    this.target.death()

    // REMOVE CHARACTER FROM PLAY
    // TRIGGER THEIR DEATHRATTLE HERE?

    notifyClient(EventType.Death, true, {})
    return true
  }
}

export default DeathEvent
