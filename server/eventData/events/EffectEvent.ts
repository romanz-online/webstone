import Character from '@character'
import { EventType } from '@constants'
import Effect from '@effect'
import Event from '@event'
import { notifyClient } from '@ws'

class EffectEvent extends Event {
  effect: Effect
  source: Character
  target: Character

  constructor(effect: Effect, source: Character, target: Character | null) {
    super(EventType.Effect)
    this.effect = effect
    this.source = source
    this.target = target
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.effect.apply(this.source, this.target)

    notifyClient(EventType.Effect, true, {})
    return true
  }
}

export default EffectEvent
