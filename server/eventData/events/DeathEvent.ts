import Event from '@event'
import { notifyClient } from '@ws'
import Character from '@character'
import { EventType } from '@constants'

class DeathEvent extends Event {
  target: Character

  constructor(target: Character) {
    super(EventType.Death)
    this.target = target
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.target.inPlay = false

    this.target.death()

    // REMOVE CHARACTER FROM PLAY
    // TRIGGER THEIR DEATHRATTLE HERE?

    notifyClient(EventType.Death, true, {})
    return true
  }
}

export default DeathEvent
